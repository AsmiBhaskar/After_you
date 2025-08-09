from django.urls import path
from .views import register_view, login_view, logout_view, check_in_view, check_in_status_view, update_user_settings_view
from .api_views import register_api, login_api, logout_api, user_profile_api

urlpatterns = [
    # Template-based views
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    
    # API endpoints for React frontend
    path('api/register/', register_api, name='register_api'),
    path('api/login/', login_api, name='login_api'),
    path('api/logout/', logout_api, name='logout_api'),
    path('api/profile/', user_profile_api, name='user_profile_api'),
    
    # Dead man's switch API endpoints
    path('api/check-in/', check_in_view, name='check_in'),
    path('api/check-in/status/', check_in_status_view, name='check_in_status'),
    path('api/settings/', update_user_settings_view, name='update_settings'),
]
