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
