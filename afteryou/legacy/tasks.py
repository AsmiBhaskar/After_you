"""
Background tasks for legacy message delivery using Django-RQ
"""
import logging
from datetime import timedelta
from django.utils import timezone
from django_rq import job
import django_rq
from .email_service import LegacyEmailService
from .models import LegacyMessage

logger = logging.getLogger(__name__)

@job('email')
def process_delivery_queue():
    """
    Task to process all pending legacy message deliveries
    This task runs periodically to check for due messages
    """
    logger.info("Starting delivery queue processing...")
    
    try:
        results = LegacyEmailService.process_pending_deliveries()
        
        if results['total_processed'] > 0:
            logger.info(
                f"Delivery batch completed: "
                f"{results['successful']} sent, "
                f"{results['failed']} failed out of "
                f"{results['total_processed']} total messages"
            )
        else:
            logger.debug("No messages due for delivery")
            
        return results
        
    except Exception as e:
        logger.error(f"Error in delivery queue processing: {str(e)}")
        return {
            'error': str(e),
            'total_processed': 0,
            'successful': 0,
            'failed': 0
        }

@job('email')
def send_single_message(message_id):
    """
    Task to send a single legacy message
    
    Args:
        message_id (str): MongoDB ObjectId of the message
    """
    logger.info(f"Processing single message delivery: {message_id}")
    
    try:
        success = LegacyEmailService.send_legacy_message(message_id)
        
        if success:
            logger.info(f"Successfully delivered message {message_id}")
        else:
            logger.warning(f"Failed to deliver message {message_id}")
            
        return success
        
    except Exception as e:
        logger.error(f"Error sending message {message_id}: {str(e)}")
        return False

@job('default')
def schedule_message(message_id):
    """
    Task to schedule a message for future delivery
    
    Args:
        message_id (str): MongoDB ObjectId of the message
    """
    logger.info(f"Scheduling message for delivery: {message_id}")
    
    try:
        success = LegacyEmailService.schedule_message_for_delivery(message_id)
        
        if success:
            logger.info(f"Successfully scheduled message {message_id}")
        else:
            logger.warning(f"Failed to schedule message {message_id}")
            
        return success
        
    except Exception as e:
        logger.error(f"Error scheduling message {message_id}: {str(e)}")
        return False

@job('email')
def retry_failed_messages():
    """
    Task to retry sending failed messages
    """
    logger.info("Starting retry of failed messages...")
    
    try:
        # Get messages that failed and are eligible for retry
        failed_messages = LegacyMessage.objects.filter(status='failed')
        
        retry_count = 0
        success_count = 0
        
        for message in failed_messages:
            # Check if message is still within delivery window (allow some flexibility)
            current_time = timezone.now()
            
            # Allow delivery up to 24 hours after scheduled time
            delivery_window = message.delivery_date + timedelta(hours=24)
            
            if current_time <= delivery_window:
                retry_count += 1
                
                # Reset status to scheduled and retry
                message.status = 'scheduled'
                message.save()
                
                if LegacyEmailService.send_legacy_message(str(message.id)):
                    success_count += 1
        
        logger.info(f"Retry completed: {success_count} successful out of {retry_count} retried")
        
        return {
            'retried': retry_count,
            'successful': success_count,
            'failed': retry_count - success_count
        }
        
    except Exception as e:
        logger.error(f"Error in retry failed messages: {str(e)}")
        return {'error': str(e)}

@job('default')
def cleanup_old_messages():
    """
    Task to clean up old sent messages (optional)
    This can be used to archive or clean up very old messages
    """
    logger.info("Starting cleanup of old messages...")
    
    try:
        # Find messages older than 1 year that have been sent
        cutoff_date = timezone.now() - timedelta(days=365)
        old_messages = LegacyMessage.objects.filter(
            status='sent',
            sent_at__lt=cutoff_date
        )
        
        count = old_messages.count()
        
        # For now, just log - you might want to archive instead of delete
        logger.info(f"Found {count} old messages eligible for cleanup")
        
        # Uncomment the next line if you want to actually delete old messages
        # old_messages.delete()
        
        return {'cleaned_up': count}
        
    except Exception as e:
        logger.error(f"Error in cleanup: {str(e)}")
        return {'error': str(e)}

# Helper functions for scheduling tasks

def schedule_message_delivery(message_id, delivery_datetime):
    """
    Schedule a specific message for delivery at a specific time
    
    Args:
        message_id (str): MongoDB ObjectId of the message
        delivery_datetime (datetime): When to deliver the message
    """
    try:
        # Get the scheduler
        scheduler = django_rq.get_scheduler('email')
        
        # Schedule the message for the specific delivery time
        job = scheduler.enqueue_at(
            delivery_datetime,
            send_single_message,
            message_id,
            job_id=f'deliver_message_{message_id}'
        )
        
        logger.info(f"Scheduled message {message_id} for delivery at {delivery_datetime}")
        return job.id
        
    except Exception as e:
        logger.error(f"Error scheduling message delivery: {str(e)}")
        return None

def enqueue_immediate_delivery(message_id):
    """
    Queue a message for immediate delivery
    
    Args:
        message_id (str): MongoDB ObjectId of the message
    """
    try:
        queue = django_rq.get_queue('email')
        job = queue.enqueue(send_single_message, message_id)
        
        logger.info(f"Queued message {message_id} for immediate delivery")
        return job.id
        
    except Exception as e:
        logger.error(f"Error queuing immediate delivery: {str(e)}")
        return None
