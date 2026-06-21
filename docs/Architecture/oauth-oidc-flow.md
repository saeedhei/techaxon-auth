📄 7. oauth-oidc-flow.md
# 🔄 OAuth2 / OpenID Connect Flow

## Step 1: Authorization Request


GET /oauth/authorize


Client redirects user to IAM.

---

## Step 2: Login / Register

User authenticates in IAM.

---

## Step 3: Authorization Code Issued


code = abc123


---

## Step 4: Token Exchange


POST /oauth/token


Response:

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "..."
}
```
Step 5: User Info
GET /oauth/userinfo
---
Flow Summary
```
Client → IAM → Login → Code → Token → API Access
```
