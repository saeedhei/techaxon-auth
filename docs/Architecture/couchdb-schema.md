# 🗄 CouchDB Schema Design

This system uses a **single CouchDB database** with type-based documents.

---

## 📌 Core Principle

Every document MUST include:

```json
{
  "type": "..."
}
📂 Document Types
user
client
session
authorization_code
refresh_token
consent
audit_log
password_reset
email_verification
⚡ Index Strategy
User Email Lookup
{
  "fields": ["type", "emailNormalized"]
}
Client Lookup
{
  "fields": ["type", "clientId"]
}
Auth Code Lookup
{
  "fields": ["type", "code"]
}
Refresh Token Lookup
{
  "fields": ["type", "tokenHash"]
}
⚠️ Key Rules
No joins (denormalized design)
Always predefine indexes
Avoid full DB scans
