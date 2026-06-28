# 🔐 TechAxon Auth: System Summary (For Login Review)

## 1. Tech Stack & Architecture

- **Framework:** NestJS (Modular, Dependency Injection-based)
- **Database:** Apache CouchDB (`techaxon_core` database, Single-Table design using `type` fields)
- **Cache:** Redis (Used for fast session lookup and token rotation tracking)
- **Database Abstraction:** Implemented the `UserRepository` interface so the `AuthService` is decoupled from CouchDB (ready for future Prisma/SQL migration if needed).

## 2. Token & Security Strategy

We use a Dual-Token Architecture to balance Security and UX:

- **Access Token (JWT):**
  - 15-minute TTL.
  - Stateless, returned in JSON body, kept in client memory.
- **Refresh Token:**
  - 7-day TTL.
  - Stored inside a secure, `HttpOnly`, `SameSite=Lax` Cookie.
  - **Security:** The raw refresh token is NEVER stored in the database. It is hashed using `bcryptjs` and verified upon rotation.
- **SSO Enablement:** The cookie is bound to `Domain=.techaxon.localhost` (dev) allowing cross-subdomain authentication (e.g., `lms.techaxon.localhost`).

## 3. The Login Flow (Step-by-Step)

1. Client POSTs `username` and `password` to `/api/auth/login`.
2. NestJS validates the payload via DTOs (`ValidationPipe`).
3. `AuthService` queries CouchDB for the user and verifies the password via `bcryptjs`.
4. Generates a 15m Access Token and 7d Refresh Token.
5. Generates a unique `sessionId` and creates a Session Document (saving the **hashed** refresh token, IP, and Device Info).
6. **MVCC Sync:** Saves the session to CouchDB, extracts the new `_rev`, and saves it to Redis.
7. Sets the `techaxon_refresh_token` cookie and returns the Access Token.

## 4. Token Rotation (Refresh Flow)

- When the 15m Access Token expires, the client hits `/api/auth/refresh`.
- NestJS reads the cookie, verifies the session in Redis (fallback to CouchDB).
- Checks if `isValid` is true and compares the hashed token.
- Issues new tokens, updates the `_rev` in CouchDB/Redis, and rotates the cookie.
