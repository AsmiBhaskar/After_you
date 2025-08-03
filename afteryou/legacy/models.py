from mongoengine import Document, StringField, DateTimeField, EmailField, ReferenceField
from datetime import datetime
from accounts.models import User

class LegacyMessage(Document):
    user_id = StringField(required=True)  
    title = StringField(required=True, max_length=200)
    content = StringField()
    recipient_email = EmailField(required=True)
    delivery_date = DateTimeField(required=True)
    
    # Status tracking
    STATUS_CHOICES = (
        ('created', 'Created ✅'),
        ('scheduled', 'Scheduled ⏰'),
        ('sent', 'Sent 📤'),
        ('failed', 'Failed ❌'),
    )
    status = StringField(max_length=10, choices=STATUS_CHOICES, default='created')
    created_at = DateTimeField(default=datetime.utcnow)
    sent_at = DateTimeField()
    
    # Meta configuration
    meta = {
        'collection': 'legacy_messages',
        'ordering': ['-created_at']
    }
    
    def __str__(self):
        return f"{self.title} - {self.recipient_email}"