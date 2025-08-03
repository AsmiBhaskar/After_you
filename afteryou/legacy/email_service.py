"""
Email service for sending legacy messages
"""
import logging
from datetime import datetime
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from .models import LegacyMessage

logger = logging.getLogger(__name__)

class LegacyEmailService:
    """Service for handling legacy message email delivery"""
    
    @staticmethod
    def send_legacy_message(message_id):
        """
        Send a legacy message via email
        
        Args:
            message_id (str): The MongoDB ObjectId of the message
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get the message from MongoDB
            message = LegacyMessage.objects.get(id=message_id)
            
            # Check if message is ready for delivery
            if message.status != 'scheduled':
                logger.warning(f"Message {message_id} is not scheduled for delivery. Status: {message.status}")
                return False
            
            # Check if delivery time has arrived
            current_time = timezone.now()
            if message.delivery_date > current_time:
                logger.info(f"Message {message_id} delivery time has not arrived yet. Scheduled for: {message.delivery_date}")
                return False
            
            # Prepare email context
            context = {
                'message': message,
                'current_time': current_time,
            }
            
            # Render email templates
            html_content = render_to_string('emails/legacy_message.html', context)
            text_content = render_to_string('emails/legacy_message.txt', context)
            
            # Create email subject
            subject = f"Legacy Message: {message.title}"
            
            # Create email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[message.recipient_email],
                headers={
                    'X-AfterYou-Message-ID': str(message.id),
                    'X-AfterYou-Created': message.created_at.isoformat(),
                    'X-AfterYou-Scheduled': message.delivery_date.isoformat(),
                }
            )
            
            # Attach HTML version
            email.attach_alternative(html_content, "text/html")
            
            # Send email
            email.send()
            
            # Update message status
            message.status = 'sent'
            message.sent_at = current_time
            message.save()
            
            logger.info(f"Successfully sent legacy message {message_id} to {message.recipient_email}")
            return True
            
        except LegacyMessage.DoesNotExist:
            logger.error(f"Legacy message {message_id} not found")
            return False
        except Exception as e:
            logger.error(f"Failed to send legacy message {message_id}: {str(e)}")
            
            # Update message status to failed
            try:
                message = LegacyMessage.objects.get(id=message_id)
                message.status = 'failed'
                message.save()
            except:
                pass
            
            return False
    
    @staticmethod
    def schedule_message_for_delivery(message_id):
        """
        Schedule a message for delivery
        
        Args:
            message_id (str): The MongoDB ObjectId of the message
            
        Returns:
            bool: True if scheduled successfully
        """
        try:
            message = LegacyMessage.objects.get(id=message_id)
            
            if message.status != 'created':
                logger.warning(f"Message {message_id} cannot be scheduled. Current status: {message.status}")
                return False
            
            # Update status to scheduled
            message.status = 'scheduled'
            message.save()
            
            logger.info(f"Message {message_id} scheduled for delivery on {message.delivery_date}")
            return True
            
        except LegacyMessage.DoesNotExist:
            logger.error(f"Message {message_id} not found")
            return False
        except Exception as e:
            logger.error(f"Failed to schedule message {message_id}: {str(e)}")
            return False
    
    @staticmethod
    def get_due_messages():
        """
        Get all messages that are due for delivery
        
        Returns:
            QuerySet: Messages ready for delivery
        """
        current_time = timezone.now()
        return LegacyMessage.objects.filter(
            status='scheduled',
            delivery_date__lte=current_time
        )
    
    @staticmethod
    def process_pending_deliveries():
        """
        Process all pending message deliveries
        
        Returns:
            dict: Summary of delivery results
        """
        due_messages = LegacyEmailService.get_due_messages()
        
        results = {
            'total_processed': 0,
            'successful': 0,
            'failed': 0,
            'message_ids': []
        }
        
        for message in due_messages:
            results['total_processed'] += 1
            results['message_ids'].append(str(message.id))
            
            if LegacyEmailService.send_legacy_message(str(message.id)):
                results['successful'] += 1
            else:
                results['failed'] += 1
        
        logger.info(f"Delivery batch completed: {results}")
        return results
