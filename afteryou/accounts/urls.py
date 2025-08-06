from django.urls import path
from .views import register_view, login_view, logout_view, check_in_view, check_in_status_view, update_user_settings_view

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('api/check-in/', check_in_view, name='check_in'),
    path('api/check-in/status/', check_in_status_view, name='check_in_status'),
    path('api/settings/', update_user_settings_view, name='update_settings'),
]
