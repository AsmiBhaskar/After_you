from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from django.core.paginator import Paginator
from datetime import datetime

from .models import LegacyMessage
from .forms import LegacyMessageForm

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
    }
    return render(request, 'legacy/dashboard.html', context)

@login_required
def create_message(request):
    """Create a new legacy message"""
    if request.method == 'POST':
        form = LegacyMessageForm(request.POST)
        if form.is_valid():
            message = form.save(request.user)
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
def delete_message(request, message_id):
    """Delete a legacy message"""
    try:
        message = LegacyMessage.objects.get(id=message_id, user_id=str(request.user.id))
        if request.method == 'POST':
            title = message.title
            message.delete()
            messages.success(request, f'Message "{title}" deleted successfully!')
            return redirect('legacy:dashboard')
    except LegacyMessage.DoesNotExist:
        messages.error(request, 'Message not found or you do not have permission to delete it.')
    
    return redirect('legacy:dashboard')

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
