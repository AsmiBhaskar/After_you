

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['GET', 'POST', 'PUT'])
@permission_classes([IsAuthenticated])
def user_settings(request):
    """Endpoint for user settings: GET returns current, POST updates (echoes) settings."""
    if request.method == 'GET':
        # Return a default settings object; customize as needed
        return Response({
            'notifications_enabled': True,
            'check_in_frequency_days': 7,
            'email_reminders': True,
            'timezone': 'UTC',
        })
    elif request.method in ['POST', 'PUT']:
        # Accept settings from frontend and echo back (no DB persistence yet)
        data = request.data
        # Optionally validate fields here
        return Response({
            'success': True,
            'settings': data
        })
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging
from .models import LegacyMessage
from .serializers import LegacyMessageSerializer, LegacyMessageCreateSerializer, UserSerializer
from .email_service import LegacyEmailService
# Try to import Redis-based tasks first, fallback to simple tasks
try:
    from .tasks import schedule_message_delivery, enqueue_immediate_delivery, get_redis_status
    REDIS_AVAILABLE = True
except ImportError:
    from .simple_tasks import schedule_message_delivery, enqueue_immediate_delivery
    REDIS_AVAILABLE = False
    
    def get_redis_status():
        return {
            'connected': False,
            'mode': 'fallback',
            'queue_info': {'queued_jobs': 0, 'failed_jobs': 0, 'workers': 0}
        }

User = get_user_model()
logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user data to response
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LegacyMessageListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LegacyMessageCreateSerializer
        return LegacyMessageSerializer
    
    def get_queryset(self):
        user = self.request.user
        return LegacyMessage.objects.filter(user_id=str(user.id)).order_by('-created_at')
    
    def perform_create(self, serializer):
        message = serializer.save()
        
        # Schedule delivery based on delivery date
        if message.delivery_date > timezone.now():
            message.status = 'scheduled'
            message.save()
            
            # Schedule the background task for future delivery
            try:
                job_id = schedule_message_delivery(str(message.id), message.delivery_date)
                if job_id:
                    message.job_id = job_id
                    logger.info(f"Scheduled message {message.id} for delivery at {message.delivery_date}")
                else:
                    logger.warning(f"Failed to schedule background task for message {message.id}")
            except Exception as e:
                logger.error(f"Error scheduling message {message.id}: {str(e)}")
                message.status = 'created'
                message.save()
        else:
            # Queue for immediate delivery
            message.status = 'created'
            message.save()
            
            try:
                job_id = enqueue_immediate_delivery(str(message.id))
                if job_id:
                    message.job_id = job_id
                    logger.info(f"Queued message {message.id} for immediate delivery")
                else:
                    logger.warning(f"Failed to queue message {message.id} for immediate delivery")
            except Exception as e:
                logger.error(f"Error queuing immediate delivery for message {message.id}: {str(e)}")

class LegacyMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LegacyMessageSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        user = self.request.user
        return LegacyMessage.objects.filter(user_id=str(user.id))
    
    def get_object(self):
        queryset = self.get_queryset()
        message_id = self.kwargs.get('id')
        try:
            obj = queryset.get(id=message_id)
            return obj
        except LegacyMessage.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Message not found')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    messages = LegacyMessage.objects.filter(user_id=str(user.id))
    
    stats = {
        'total_messages': messages.count(),
        'scheduled': messages.filter(status='scheduled').count(),
        'sent': messages.filter(status='sent').count(),
        'failed': messages.filter(status='failed').count(),
        'created': messages.filter(status='created').count(),
        'pending': messages.filter(status='pending').count(),
    }
    
    return Response(stats)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_status(request):
    """Get system status including Redis connection and queue information"""
    redis_status = get_redis_status()
    
    # Get job statistics
    user = request.user
    user_messages = LegacyMessage.objects.filter(user_id=str(user.id))
    pending_jobs = user_messages.filter(status='pending').count()
    
    status_data = {
        'redis_available': REDIS_AVAILABLE,
        'redis_connected': redis_status.get('connected', False),
        'mode': redis_status.get('mode', 'fallback'),
        'queue_info': redis_status.get('queue_info', {}),
        'user_pending_jobs': pending_jobs,
        'system_time': timezone.now().isoformat(),
    }
    
    return Response(status_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def job_status(request, job_id):
    """Get status of a specific job"""
    try:
        if REDIS_AVAILABLE:
            from .tasks import get_job_status
            job_info = get_job_status(job_id)
            return Response(job_info)
        else:
            return Response({
                'job_id': job_id,
                'status': 'unknown',
                'message': 'Redis not available - using fallback system'
            })
    except Exception as e:
        return Response({
            'error': str(e),
            'job_id': job_id,
            'status': 'error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_test_message(request):
    """Send a test message immediately"""
    try:
        message_id = request.data.get('message_id')
        if not message_id:
            return Response({'error': 'message_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify user owns this message
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
        
        # Send test message using email service
        success = LegacyEmailService.send_test_message(str(message.id))
        
        if success:
            return Response({
                'success': True,
                'message': 'Test message sent successfully'
            })
        else:
            return Response({
                'error': 'Failed to send test message'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except LegacyMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_message_api(request):
    """Schedule a message for delivery"""
    try:
        message_id = request.data.get('message_id')
        if not message_id:
            return Response({'error': 'message_id required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify user owns this message
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
        
        if message.status != 'created':
            return Response({'error': f'Message cannot be scheduled. Current status: {message.status}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Schedule the message using email service
        success = LegacyEmailService.schedule_message_for_delivery(str(message.id))
        
        if success:
            return Response({
                'success': True,
                'message': f'Message scheduled for delivery on {message.delivery_date}'
            })
        else:
            return Response({
                'error': 'Failed to schedule message'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except LegacyMessage.DoesNotExist:
        return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'user')
        
        if not all([username, email, password]):
            return Response({'error': 'Username, email, and password are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role
        )
        
        serializer = UserSerializer(user)
        return Response({
            'success': True,
            'user': serializer.data,
            'message': 'User created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
