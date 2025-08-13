
# DEPRECATED: All views in this file are deprecated in favor of DRF API endpoints in api_views.py
# Remove these after frontend migration is complete.

from django.http import HttpResponse

def deprecated_view(*args, **kwargs):
    raise NotImplementedError("This view is deprecated. Use the DRF API endpoints instead.")

dashboard = deprecated_view

create_message = deprecated_view

message_detail = deprecated_view

schedule_message_view = deprecated_view

send_message_now = deprecated_view

delete_message = deprecated_view

test_email = deprecated_view

create_legacy = deprecated_view
