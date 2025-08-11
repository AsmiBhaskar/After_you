from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.timezone import now
from datetime import timedelta
from django.db import connection
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    """API endpoint for user registration"""
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'password2']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    {'error': f'{field} is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Check if passwords match
        if data['password'] != data['password2']:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if username already exists
        if User.objects.filter(username=data['username']).exists():
            return Response(
                {'error': 'Username already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email already exists
        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'error': 'Email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate password strength
        try:
            validate_password(data['password'])
        except ValidationError as e:
            return Response(
                {'error': list(e.messages)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            last_check_in=now()  # Set initial check-in time
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """API endpoint for user login"""
    try:
        data = request.data
        
        # Validate required fields
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid username or password'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'Account is disabled'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': 'admin' if user.is_superuser else 'user',
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    """API endpoint for user logout"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_api(request):
    """Get current user profile"""
    try:
        user = request.user
        current_time = now()
        
        # Calculate when user should check in next
        months_in_days = 30 * user.check_in_interval_months
        next_check_in_due = user.last_check_in + timedelta(days=months_in_days)
        
        # Calculate if user is overdue
        is_overdue = current_time > next_check_in_due
        
        # Check if in grace period
        in_grace_period = False
        grace_period_end = None
        if user.notification_sent_at:
            grace_period_end = user.notification_sent_at + timedelta(days=user.grace_period_days)
            in_grace_period = current_time < grace_period_end
        
        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': 'admin' if user.is_superuser else 'user',
            },
            'dead_mans_switch': {
                'last_check_in': user.last_check_in.isoformat() if user.last_check_in else None,
                'next_check_in_due': next_check_in_due.isoformat(),
                'check_in_interval_months': user.check_in_interval_months,
                'grace_period_days': user.grace_period_days,
                'is_overdue': is_overdue,
                'notification_sent_at': user.notification_sent_at.isoformat() if user.notification_sent_at else None,
                'in_grace_period': in_grace_period,
                'grace_period_end': grace_period_end.isoformat() if grace_period_end else None,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow anyone to test
def dashboard_stats_api(request):
    """Get dashboard statistics"""
    try:
        user = request.user
        current_time = now()
        
        # Get user's check-in stats
        months_in_days = 30 * user.check_in_interval_months
        next_check_in_due = user.last_check_in + timedelta(days=months_in_days)
        is_overdue = current_time > next_check_in_due
        
        # Check if in grace period
        in_grace_period = False
        if user.notification_sent_at:
            grace_period_end = user.notification_sent_at + timedelta(days=user.grace_period_days)
            in_grace_period = current_time < grace_period_end
        
        # Get message stats
        try:
            from legacy.models import LegacyMessage
            scheduled_messages = LegacyMessage.objects.filter(user=user, status='scheduled').count()
            total_messages = LegacyMessage.objects.filter(user=user).count()
        except:
            scheduled_messages = 0
            total_messages = 0
        
        # Get digital locker stats
        try:
            from legacy.digital_locker_models import DigitalLocker
            digital_lockers = DigitalLocker.objects.filter(user=user).count()
        except:
            digital_lockers = 0
        
        return Response({
            'check_in_status': {
                'last_check_in': user.last_check_in.isoformat() if user.last_check_in else None,
                'next_check_in_due': next_check_in_due.isoformat(),
                'is_overdue': is_overdue,
                'in_grace_period': in_grace_period,
                'check_in_interval_months': user.check_in_interval_months,
                'grace_period_days': user.grace_period_days,
            },
            'messages': {
                'scheduled': scheduled_messages,
                'total': total_messages,
            },
            'digital_lockers': digital_lockers,
            'user_info': {
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat(),
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily allow anyone to test
def system_status_api(request):
    """Get system status information"""
    try:
        # Test database connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_connected = True
        except:
            db_connected = False
        
        # Test Redis connection
        redis_connected = False
        redis_info = {}
        try:
            import redis
            from django.conf import settings
            redis_client = redis.Redis.from_url(settings.CELERY_BROKER_URL)
            redis_client.ping()
            redis_connected = True
            redis_info = redis_client.info()
        except:
            redis_connected = False
        
        # Get Celery worker status
        celery_workers = 0
        queue_info = {
            'queued_jobs': 0,
            'failed_jobs': 0,
            'workers': 0,
            'default_queue_size': 0,
            'email_queue_size': 0,
        }
        
        try:
            from celery import Celery
            from django.conf import settings
            app = Celery('afteryou')
            app.config_from_object('django.conf:settings', namespace='CELERY')
            
            # Get active workers
            inspect = app.control.inspect()
            if inspect:
                active_workers = inspect.active()
                if active_workers:
                    celery_workers = len(active_workers)
                    queue_info['workers'] = celery_workers
                    
                    # Count active tasks
                    total_active = 0
                    for worker, tasks in active_workers.items():
                        total_active += len(tasks)
                    queue_info['queued_jobs'] = total_active
        except Exception as e:
            # Celery might not be available
            pass
        
        # System health calculation
        health_score = 100
        if not db_connected:
            health_score -= 50
        if not redis_connected:
            health_score -= 30
        if celery_workers == 0:
            health_score -= 20
            
        status_mode = 'healthy' if health_score >= 80 else 'degraded' if health_score >= 50 else 'critical'
        
        return Response({
            'status': {
                'overall': status_mode,
                'health_score': health_score,
                'database_connected': db_connected,
                'redis_connected': redis_connected,
                'mode': 'normal' if redis_connected and db_connected else 'fallback',
                'queue_info': queue_info,
            },
            'services': {
                'database': {
                    'status': 'connected' if db_connected else 'disconnected',
                    'engine': 'SQLite' if 'sqlite' in str(connection.settings_dict.get('ENGINE', '')) else 'Other'
                },
                'redis': {
                    'status': 'connected' if redis_connected else 'disconnected',
                    'info': {
                        'version': redis_info.get('redis_version', 'Unknown'),
                        'memory_usage': redis_info.get('used_memory_human', 'Unknown'),
                    } if redis_connected else {}
                },
                'celery': {
                    'workers': celery_workers,
                    'status': 'active' if celery_workers > 0 else 'inactive'
                }
            },
            'timestamp': now().isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': {
                'overall': 'error',
                'health_score': 0,
                'database_connected': False,
                'redis_connected': False,
                'mode': 'error',
                'queue_info': {
                    'queued_jobs': 0,
                    'failed_jobs': 0,
                    'workers': 0,
                    'default_queue_size': 0,
                    'email_queue_size': 0,
                },
            },
            'error': str(e),
            'timestamp': now().isoformat()
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_status_api(request, job_id):
    """Get status of a specific job"""
    try:
        # This is a placeholder for job status checking
        # In a real implementation, you would check the job status from Celery
        
        try:
            from celery.result import AsyncResult
            result = AsyncResult(job_id)
            
            job_status = {
                'id': job_id,
                'state': result.state,
                'successful': result.successful() if result.ready() else False,
                'failed': result.failed() if result.ready() else False,
                'ready': result.ready(),
                'result': result.result if result.ready() and result.successful() else None,
                'traceback': result.traceback if result.failed() else None,
                'timestamp': now().isoformat()
            }
            
        except Exception as e:
            job_status = {
                'id': job_id,
                'state': 'UNKNOWN',
                'successful': False,
                'failed': False,
                'ready': False,
                'result': None,
                'error': str(e),
                'timestamp': now().isoformat()
            }
        
        return Response(job_status, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': str(e), 'job_id': job_id},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
