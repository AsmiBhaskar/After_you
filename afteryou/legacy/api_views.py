from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import LegacyMessage
from .serializers import LegacyMessageSerializer, LegacyMessageCreateSerializer, UserSerializer
from .email_service import LegacyEmailService

User = get_user_model()

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
        
        # Schedule delivery if in future
        if message.delivery_date > timezone.now():
            message.status = 'scheduled'
            message.save()
            # TODO: Add scheduling logic when tasks are working
        else:
            # Immediate delivery
            message.status = 'created'
            message.save()

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
    }
    
    return Response(stats)

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
