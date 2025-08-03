from django.urls import path
from .views import (
    dashboard, create_message, message_detail, delete_message, 
    schedule_message_view, send_message_now, test_email, create_legacy
)

app_name = 'legacy'

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('create/', create_message, name='create_message'),
    path('message/<str:message_id>/', message_detail, name='message_detail'),
    path('message/<str:message_id>/delete/', delete_message, name='delete_message'),
    path('message/<str:message_id>/schedule/', schedule_message_view, name='schedule_message'),
    path('message/<str:message_id>/send-now/', send_message_now, name='send_message_now'),
    path('test-email/', test_email, name='test_email'),
    path('test-legacy/', create_legacy, name='test_legacy'),  # Keep for testing
]
