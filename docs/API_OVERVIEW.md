# API Documentation: AfterYou Platform

This documentation provides an overview of the main API endpoints for the AfterYou digital legacy platform. It is designed for developers integrating with the backend or maintaining the system.

## Authentication
All API endpoints require JWT authentication unless otherwise noted. Obtain a token via `/api/token/` and include it as `Authorization: Bearer <token>` in requests.

---

## Endpoints

### 1. Legacy Messages
- **List/Create Messages**
  - `GET /api/messages/` — List all messages for the authenticated user.
  - `POST /api/messages/` — Create a new legacy message.
- **Retrieve/Update/Delete Message**
  - `GET /api/messages/{id}/` — Retrieve a specific message.
  - `PUT /api/messages/{id}/` — Update a message.
  - `DELETE /api/messages/{id}/` — Delete a message.
- **Send Test Message**
  - `POST /api/messages/send-test/` — Send a test message (provide `message_id`).
- **Schedule Message**
  - `POST /api/messages/schedule/` — Schedule a message for delivery (provide `message_id`).

### 2. User Settings
- **Get/Update Settings**
  - `GET /api/settings/` — Get current user settings.
  - `POST /api/settings/` or `PUT /api/settings/` — Update user settings.

### 3. Dead Man's Switch (Check-In)
- **Check-In**
  - `POST /api/check-in/` — Check in to reset your timer.
- **Check-In Status**
  - `GET /api/check-in/status/` — Get your current check-in status.

### 4. Dashboard & System
- **Dashboard Stats**
  - `GET /dashboard/stats/` — Get message and system stats for the user.
- **System Status**
  - `GET /system/status/` — Get system/queue/Redis status.
- **Job Status**
  - `GET /jobs/{job_id}/status/` — Get status of a background job.

---

## Example Request: Get All Messages
```http
GET /api/messages/
Authorization: Bearer <your_token>
```

## Example Response
```json
[
  {
    "id": "abc123",
    "title": "For my family",
    "content": "I love you all...",
    "recipient_email": "mom@example.com",
    "delivery_date": "2030-01-01T12:00:00Z",
    "status": "scheduled",
    "created_at": "2025-08-13T10:00:00Z",
    "sent_at": null,
    "user_email": "user@example.com",
    "job_id": "rq:job:xyz456"
  }
]
```

---

## Notes
- All endpoints return JSON.
- Errors are returned as JSON with an `error` field and appropriate HTTP status code.
- For full OpenAPI/Swagger docs, see `/swagger/` (if enabled in your deployment).

---

## See Also
- [Django REST Framework](https://www.django-rest-framework.org/)
- [JWT Authentication](https://jwt.io/)
- [drf-yasg (Swagger for DRF)](https://drf-yasg.readthedocs.io/en/stable/)
