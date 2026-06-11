
# 📦 Data Model

This IAM system uses a document-based schema in CouchDB.

---

## 👤 User

```json
{
  "type": "user",
  "email": "user@test.com",
  "passwordHash": "argon2id...",
  "emailVerified": true,
  "roles": ["user"]
}
🧑‍💻 Client
{
  "type": "client",
  "clientId": "app-123",
  "redirectUris": ["https://app.test.com/callback"],
  "scopes": ["openid", "profile", "email"]
}
🔐 Authorization Code
{
  "type": "authorization_code",
  "code": "xyz",
  "userId": "user:123",
  "clientId": "app-123",
  "codeChallenge": "S256...",
  "expiresAt": 1710000000
}
🔄 Refresh Token
{
  "type": "refresh_token",
  "tokenHash": "sha256...",
  "userId": "user:123",
  "clientId": "app-123"
}

---


