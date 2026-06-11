
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

# 📄 4. `api-architecture.md`

```md
# 🌐 API Architecture

## Authentication APIs

### Register

POST /register


### Login

POST /login


### OAuth2 Authorization

GET /oauth/authorize


### Token Exchange

POST /oauth/token


### User Info

GET /oauth/userinfo


---

## 🔁 Flow

1. Client redirects user to `/oauth/authorize`
2. User logs in or registers
3. Authorization code is generated
4. Client exchanges code for tokens
