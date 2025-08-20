# LEGACY_CHAIN_README.md

## Overview
This document describes the "Chain of Memories" feature for the AfterYou project, including backend, API, and frontend details.

---

## 1. Feature Description
The "Chain of Memories" feature allows recipients of a legacy message to extend the message by adding their own, forming a chain. Each message in the chain is linked to its parent, and the full chain can be viewed by any recipient with a valid access token.

---

## 2. Backend Implementation
- **Model Changes:**
  - Added `parent_message`, `chain_id`, `generation`, `sender_name`, and `recipient_access_token` fields to the legacy message model (MongoEngine).
- **API Endpoints:**
  - `GET /api/legacy/chain/<access_token>/` — View a chain message and its history.
  - `POST /api/legacy/chain/<access_token>/extend/` — Extend a chain by adding a new message.
  - `GET /api/legacy/chains/` — List all chains for the authenticated user.
- **Serializers:**
  - Updated to include new chain fields and nested chain serialization.
- **Email Service:**
  - Email templates and logic updated to support chain messages and provide access links.

---

## 3. Frontend Implementation
- **HTML Template:**
  - `templates/legacy/chain_message_view.html` provides a UI for viewing and extending chain messages.
- **JavaScript:**
  - Handles token extraction from URL, API calls for viewing/extending chains, and dynamic UI updates.

---

## 4. Usage
1. **Receiving a Chain Message:**
   - Recipient receives an email with a unique access link.
2. **Viewing the Chain:**
   - Accessing the link displays the message and its chain history.
3. **Extending the Chain:**
   - Recipient can add their own message, extending the chain for future recipients.

---

## 5. Testing & Validation
- API endpoints and frontend have been tested for:
  - Chain creation, extension, and viewing
  - Token validation and error handling
  - Email delivery and access link correctness

---

## 6. Additional Notes
- **Security:** Access to chain messages is protected by unique tokens.
- **Extensibility:** The chain model supports arbitrary depth and branching.
- **Environment:** SMTP credentials and other sensitive settings are managed via environment variables.

---

## 7. File Locations
- **Backend:** `legacy/models.py`, `legacy/api_views.py`, `legacy/serializers.py`, `legacy/email_service.py`, `legacy/urls.py`, `legacy/api_urls.py`
- **Frontend:** `templates/legacy/chain_message_view.html`
- **Documentation:** `documentation/LEGACY_CHAIN_README.md`

---

## 8. Contact
For questions or contributions, contact the project maintainer.
