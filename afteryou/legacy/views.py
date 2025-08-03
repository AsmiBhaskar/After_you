from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.core.paginator import Paginator
from django.views.decorators.http import require_POST
from datetime import datetime
from django.utils import timezone

from .models import LegacyMessage
from .forms import LegacyMessageForm
from .email_service import LegacyEmailService
from .tasks import schedule_message_delivery, schedule_message, enqueue_immediate_delivery

@login_required
def dashboard(request):
    """Main dashboard showing user's legacy messages"""
    user_messages = LegacyMessage.objects(user_id=str(request.user.id))
    
    # Pagination
    paginator = Paginator(list(user_messages), 10)  # 10 messages per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'messages': page_obj,
        'total_count': user_messages.count(),
        'created_count': user_messages.filter(status='created').count(),
        'scheduled_count': user_messages.filter(status='scheduled').count(),
        'sent_count': user_messages.filter(status='sent').count(),
        'failed_count': user_messages.filter(status='failed').count(),
    }
    return render(request, 'legacy/dashboard.html', context)

@login_required
def create_message(request):
    """Create a new legacy message"""
    if request.method == 'POST':
        form = LegacyMessageForm(request.POST)
        if form.is_valid():
            message = form.save(request.user)
            
            # Auto-schedule the message if delivery date is set
            if message.delivery_date:
                try:
                    # Schedule the message for delivery
                    schedule_message(str(message.id))
                    messages.success(
                        request, 
                        f'Legacy message "{message.title}" created and scheduled for delivery on {message.delivery_date.strftime("%B %d, %Y at %I:%M %p")}!'
                    )
                except Exception as e:
                    messages.warning(
                        request,
                        f'Message created but scheduling failed: {str(e)}. You can manually schedule it later.'
                    )
            else:
                messages.success(request, f'Legacy message "{message.title}" created successfully!')
            
            return redirect('legacy:dashboard')
    else:
        form = LegacyMessageForm()
    
    return render(request, 'legacy/create_message.html', {'form': form})

@login_required
def message_detail(request, message_id):
    """View details of a specific message"""
    try:
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
    except LegacyMessage.DoesNotExist:
        messages.error(request, 'Message not found or you do not have permission to view it.')
        return redirect('legacy:dashboard')
    
    return render(request, 'legacy/message_detail.html', {'message': message})

@login_required
@require_POST
def schedule_message_view(request, message_id):
    """Schedule a message for delivery"""
    try:
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
        
        if message.status != 'created':
            return JsonResponse({
                'success': False, 
                'error': f'Message cannot be scheduled. Current status: {message.status}'
            })
        
        # Schedule the message
        success = schedule_message(str(message.id))
        
        if success:
            return JsonResponse({
                'success': True,
                'message': f'Message scheduled for delivery on {message.delivery_date.strftime("%B %d, %Y at %I:%M %p")}'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to schedule message'
            })
            
    except LegacyMessage.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Message not found'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@login_required
@require_POST
def send_message_now(request, message_id):
    """Send a message immediately (for testing)"""
    try:
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
        
        if message.status == 'sent':
            return JsonResponse({
                'success': False,
                'error': 'Message has already been sent'
            })
        
        # Send the message immediately
        success = enqueue_immediate_delivery(str(message.id))
        
        if success:
            messages.success(request, f'Message "{message.title}" queued for immediate delivery!')
            return JsonResponse({
                'success': True,
                'message': 'Message queued for delivery'
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Failed to send message'
            })
            
    except LegacyMessage.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Message not found'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@login_required
def delete_message(request, message_id):
    """Delete a legacy message"""
    try:
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
        
        if request.method == 'POST':
            # Only allow deletion of created or failed messages
            if message.status in ['created', 'failed']:
                title = message.title
                message.delete()
                messages.success(request, f'Message "{title}" deleted successfully!')
            else:
                messages.error(request, f'Cannot delete message with status: {message.status}')
                
            return redirect('legacy:dashboard')
            
    except LegacyMessage.DoesNotExist:
        messages.error(request, 'Message not found or you do not have permission to delete it.')
    
    return redirect('legacy:dashboard')

@login_required
def test_email(request):
    """Test email functionality"""
    if request.method == 'POST':
        # Create a test message
        test_message = LegacyMessage(
            user_id=str(request.user.id),
            title="Test Email - AfterYou",
            content="This is a test email to verify that the email delivery system is working correctly. If you receive this, the system is functioning properly!",
            recipient_email=request.user.email,
            delivery_date=timezone.now(),
            status='scheduled'
        )
        test_message.save()
        
        # Send immediately
        success = LegacyEmailService.send_legacy_message(str(test_message.id))
        
        if success:
            messages.success(request, f'Test email sent successfully to {request.user.email}!')
        else:
            messages.error(request, 'Failed to send test email. Check your email configuration.')
        
        return redirect('legacy:dashboard')
    
    return render(request, 'legacy/test_email.html')

# Keep the old create_legacy for testing (but improve it)
@login_required
def create_legacy(request):
    """Legacy endpoint for testing - improved version"""
    if request.method == 'POST':
        msg = LegacyMessage(
            user_id=str(request.user.id),
            title="Test Legacy Message",
            content="This is a test message created via the legacy endpoint.",
            recipient_email="test@example.com",
            delivery_date=datetime(2030, 1, 1),
            status='created'
        )
        msg.save()
        return HttpResponse(f"Legacy message saved with ID: {msg.id}")
    return HttpResponse("Only POST supported.")
