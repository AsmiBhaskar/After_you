# REST API Reference

This document provides complete reference for the AfterYou Legacy Message System API.

## Base URL

```
http://localhost:8000/api/legacy/
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Content Types

- Request Content-Type: `application/json`
- Response Content-Type: `application/json`

## Legacy Messages API

### Create Message

Creates a new legacy message and schedules it for delivery.

**Endpoint:** `POST /api/legacy/messages/`

**Request Body:**
```json
{
    "recipient_email": "user@example.com",
    "recipient_name": "John Doe",
    "sender_name": "Jane Smith", 
    "message_content": "Your legacy message content here",
    "delivery_date": "2024-12-25T10:00:00Z",
    "is_active": true
}
```

**Field Descriptions:**
- `recipient_email` (string, required): Valid email address of the recipient
- `recipient_name` (string, required): Display name of the recipient
- `sender_name` (string, required): Display name of the sender
- `message_content` (string, required): The message content to be delivered
- `delivery_date` (string, required): ISO 8601 formatted datetime for delivery
- `is_active` (boolean, optional): Whether the message is active (default: true)

**Response (201 Created):**
```json
{
    "id": "677123abc456def789",
    "recipient_email": "user@example.com",
    "recipient_name": "John Doe",
    "sender_name": "Jane Smith",
    "message_content": "Your legacy message content here",
    "delivery_date": "2024-12-25T10:00:00Z",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00Z",
    "job_id": "rq:job:abc123",
    "status": "pending"
}
```

**Response Fields:**
- `id`: MongoDB ObjectId as string
- `created_at`: ISO 8601 formatted creation timestamp
- `job_id`: Redis queue job identifier (if Redis available)
- `status`: Message status ("pending", "scheduled", "delivered", "failed")

**Error Responses:**

**400 Bad Request:**
```json
{
    "recipient_email": ["This field is required."],
    "delivery_date": ["Enter a valid date/time."]
}
```

**500 Internal Server Error:**
```json
{
    "error": "Internal server error",
    "detail": "Error message details"
}
```

### List Messages

Retrieves a list of all legacy messages.

**Endpoint:** `GET /api/legacy/messages/`

**Query Parameters:**
- `is_active` (boolean): Filter by active status
- `status` (string): Filter by message status
- `recipient_email` (string): Filter by recipient email

**Response (200 OK):**
```json
[
    {
        "id": "677123abc456def789",
        "recipient_email": "user@example.com",
        "recipient_name": "John Doe",
        "sender_name": "Jane Smith",
        "message_content": "Your legacy message content here",
        "delivery_date": "2024-12-25T10:00:00Z",
        "is_active": true,
        "created_at": "2024-01-01T12:00:00Z",
        "job_id": "rq:job:abc123",
        "status": "pending"
    }
]
```

### Retrieve Message

Retrieves a specific legacy message by ID.

**Endpoint:** `GET /api/legacy/messages/{id}/`

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the message

**Response (200 OK):**
```json
{
    "id": "677123abc456def789",
    "recipient_email": "user@example.com",
    "recipient_name": "John Doe",
    "sender_name": "Jane Smith",
    "message_content": "Your legacy message content here",
    "delivery_date": "2024-12-25T10:00:00Z",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00Z",
    "job_id": "rq:job:abc123",
    "status": "pending"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
    "detail": "Not found."
}
```

### Update Message

Updates an existing legacy message.

**Endpoint:** `PUT /api/legacy/messages/{id}/`

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the message

**Request Body:** Same as Create Message

**Response (200 OK):** Same as Create Message

### Partial Update Message

Partially updates an existing legacy message.

**Endpoint:** `PATCH /api/legacy/messages/{id}/`

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the message

**Request Body:** Any subset of Create Message fields

**Response (200 OK):** Same as Create Message

### Delete Message

Deletes an existing legacy message.

**Endpoint:** `DELETE /api/legacy/messages/{id}/`

**Path Parameters:**
- `id` (string, required): MongoDB ObjectId of the message

**Response (204 No Content):** Empty body

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Resource deleted successfully |
| 400 | Bad Request | Invalid request data |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error occurred |

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Examples

### Creating a Message with curl

```bash
curl -X POST http://localhost:8000/api/legacy/messages/ \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "user@example.com",
    "recipient_name": "John Doe",
    "sender_name": "Jane Smith",
    "message_content": "This is your legacy message",
    "delivery_date": "2024-12-25T10:00:00Z",
    "is_active": true
  }'
```

### Creating a Message with Python requests

```python
import requests
from datetime import datetime, timezone

url = "http://localhost:8000/api/legacy/messages/"
data = {
    "recipient_email": "user@example.com",
    "recipient_name": "John Doe",
    "sender_name": "Jane Smith",
    "message_content": "This is your legacy message",
    "delivery_date": "2024-12-25T10:00:00Z",
    "is_active": True
}

response = requests.post(url, json=data)
if response.status_code == 201:
    message = response.json()
    print(f"Message created with ID: {message['id']}")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

### JavaScript/Node.js Example

```javascript
const fetch = require('node-fetch');

const createMessage = async () => {
  const url = 'http://localhost:8000/api/legacy/messages/';
  const data = {
    recipient_email: 'user@example.com',
    recipient_name: 'John Doe',
    sender_name: 'Jane Smith',
    message_content: 'This is your legacy message',
    delivery_date: '2024-12-25T10:00:00Z',
    is_active: true
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const message = await response.json();
      console.log('Message created:', message);
    } else {
      console.error('Error:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

createMessage();
```

## Backend Integration Details

### Task Queue Integration

When a message is created:
1. Message is saved to MongoDB
2. Background job is queued in Redis (if available)
3. Fallback to SimpleTaskQueue if Redis unavailable
4. Job ID is stored with message for tracking

### Email Delivery

Messages are delivered via:
- HTML formatted emails with professional styling
- Plain text fallback version
- Custom email templates
- Delivery scheduling based on delivery_date

### Error Handling

The API implements comprehensive error handling:
- Validation errors return 400 with field-specific messages
- Database errors are caught and logged
- Redis connection failures trigger fallback mechanisms
- Email delivery failures are retried automatically

## Troubleshooting

### Common Issues

**1. Message not being delivered:**
- Check Redis connection status
- Verify RQ worker is running
- Check email service configuration

**2. 500 Internal Server Error:**
- Check Django logs for detailed error messages
- Verify MongoDB connection
- Ensure all required environment variables are set

**3. Invalid date format:**
- Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`
- Include timezone information
- Future dates only for scheduling

For more troubleshooting information, see the [Troubleshooting Guide](./troubleshooting.md).
