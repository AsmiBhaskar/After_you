"""
Management command to process legacy message deliveries
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from legacy.email_service import LegacyEmailService
from legacy.models import LegacyMessage

class Command(BaseCommand):
    help = 'Process pending legacy message deliveries'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be processed without actually sending emails',
        )
        parser.add_argument(
            '--message-id',
            type=str,
            help='Process a specific message by ID',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        message_id = options['message_id']
        
        if message_id:
            # Process specific message
            self.process_single_message(message_id, dry_run)
        else:
            # Process all due messages
            self.process_all_due_messages(dry_run)

    def process_single_message(self, message_id, dry_run):
        """Process a single message"""
        try:
            message = LegacyMessage.objects.get(id=message_id)
            
            self.stdout.write(f"Processing message: {message.title}")
            self.stdout.write(f"Recipient: {message.recipient_email}")
            self.stdout.write(f"Status: {message.status}")
            self.stdout.write(f"Delivery Date: {message.delivery_date}")
            
            if dry_run:
                self.stdout.write(
                    self.style.WARNING('DRY RUN: Would send email but not actually sending')
                )
            else:
                success = LegacyEmailService.send_legacy_message(message_id)
                if success:
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully sent message {message_id}')
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(f'Failed to send message {message_id}')
                    )
                    
        except LegacyMessage.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Message {message_id} not found')
            )

    def process_all_due_messages(self, dry_run):
        """Process all messages due for delivery"""
        current_time = timezone.now()
        
        self.stdout.write(f"Checking for messages due at: {current_time}")
        
        # Get all due messages
        due_messages = LegacyEmailService.get_due_messages()
        
        if not due_messages:
            self.stdout.write("No messages due for delivery")
            return
        
        self.stdout.write(f"Found {due_messages.count()} messages due for delivery")
        
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE - No emails will be sent"))
            for message in due_messages:
                self.stdout.write(f"Would send: {message.title} to {message.recipient_email}")
        else:
            results = LegacyEmailService.process_pending_deliveries()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Delivery batch completed: "
                    f"{results['successful']} sent, "
                    f"{results['failed']} failed out of "
                    f"{results['total_processed']} total messages"
                )
            )
            
            if results['failed'] > 0:
                self.stdout.write(
                    self.style.WARNING(f"Failed message IDs: {results['message_ids']}")
                )
