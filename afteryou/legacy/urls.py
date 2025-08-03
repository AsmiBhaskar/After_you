from django.urls import path
from .views import dashboard, create_message, message_detail, delete_message, create_legacy

app_name = 'legacy'

urlpatterns = [
    path('', dashboard, name='dashboard'),
    path('create/', create_message, name='create_message'),
    path('message/<str:message_id>/', message_detail, name='message_detail'),
    path('message/<str:message_id>/delete/', delete_message, name='delete_message'),
    path('test-legacy/', create_legacy, name='test_legacy'),  # Keep for testing
]
