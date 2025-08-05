from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import LegacyMessage

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'bio']
        read_only_fields = ['id']

class LegacyMessageSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user_id', read_only=True)
    
    class Meta:
        model = LegacyMessage
        fields = [
            'id', 'title', 'content', 'recipient_email', 
            'delivery_date', 'status', 'created_at', 'sent_at',
            'user_email', 'job_id'
        ]
        read_only_fields = ['id', 'created_at', 'sent_at', 'user_email', 'job_id']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Convert ObjectId to string
        data['id'] = str(instance.id)
        # Format dates
        if instance.created_at:
            data['created_at'] = instance.created_at.isoformat()
        if instance.delivery_date:
            data['delivery_date'] = instance.delivery_date.isoformat()
        if instance.sent_at:
            data['sent_at'] = instance.sent_at.isoformat()
        return data

class LegacyMessageCreateSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    content = serializers.CharField(allow_blank=True)
    recipient_email = serializers.EmailField()
    delivery_date = serializers.DateTimeField()

    def validate_delivery_date(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("Delivery date must be in the future.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        message = LegacyMessage(
            user_id=str(user.id),
            title=validated_data['title'],
            content=validated_data['content'],
            recipient_email=validated_data['recipient_email'],
            delivery_date=validated_data['delivery_date'],
            status='created'
        )
        message.save()
        return message
