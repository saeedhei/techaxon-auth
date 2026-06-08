# Authentication Architecture & Security Strategy

## 1. Overview
This document outlines the architectural decisions and security implementations for the TechAxon API-First Authentication system. The system is designed to be stateless for resource servers, highly available, and capable of seamless Single Sign-On (SSO) across multiple sub-applications (e.g., Kanban, LMS, CRM).

## 2. Infrastructure & Package Management
- **Package Manager (`pnpm`)**: We utilize `pnpm` exclusively. This ensures strict, deterministic dependency resolution, avoids hoisting bugs common in `npm`/`yarn`, and significantly speeds up our Docker build times by utilizing a global store.
- **Environment Isolation**: The Next.js API, CouchDB, and Redis instances operate inside isolated Docker containers orchestrated by `docker-compose`. 

## 3. Cryptography & Hashing
- **Library Choice (`bcryptjs` vs `bcrypt`)**: We selected `bcryptjs` (a pure JavaScript implementation) over the standard `bcrypt` package. The standard `bcrypt` relies on C++ node-gyp bindings which frequently fail to compile or cause runtime crashes inside lightweight Alpine Linux Docker containers. `bcryptjs` provides the exact same cryptographic security without the binary dependency overhead.
- **Token Hashing**: To mitigate the impact of a potential database breach, **Refresh Tokens are never stored in plaintext**. They are cryptographically hashed using `bcryptjs` before being persisted to CouchDB.

## 4. Dual-Token Architecture (JWT)
The system employs a dual-token JWT mechanism to balance security with user experience:
1. **Access Tokens (15-Minute TTL)**: 
   - Completely stateless.
   - Returned in the JSON response body during login/refresh.
   - Must be kept in memory by the client (never in `localStorage`).
2. **Refresh Tokens (7-Day TTL)**:
   - Stateful and trackable.
   - Bound to a specific `sessionId`.
   - Used exclusively to request new Access Tokens.

## 5. Session Persistence & Caching Strategy
To achieve both data durability and high performance, session state is managed across two database layers:
- **Primary Store (Apache CouchDB)**: Acts as the source of truth. Stores the persistent `Session` document, including the `userId`, `deviceInfo`, IP address, and the `hashedRefreshToken`.
- **In-Memory Cache (Redis)**: When a session is created, it is simultaneously written to Redis with an exact 7-day Time-To-Live (TTL). During the token rotation phase (`/api/auth/refresh`), the system queries Redis first. This ultra-fast lookup prevents the CouchDB instance from becoming a bottleneck during high-traffic token refresh cycles.

## 6. Single Sign-On (SSO) & Cookie Strategy
To facilitate SSO across all `*.techaxon.de` (or local `*.techaxon.localhost`) applications, we rely on top-level domain cookies.
- **Delivery Mechanism**: The Refresh Token and its associated Session ID are combined (`sessionId:refreshToken`) and delivered exclusively via a `Set-Cookie` header.
- **Security Flags**:
  - `HttpOnly`: Strictly prevents cross-site scripting (XSS) attacks from accessing the token via `document.cookie`.
  - `Secure`: Enforced in production to ensure tokens only travel over HTTPS.
  - `SameSite=Lax`: Provides CSRF protection while allowing the cookie to be sent during top-level navigations across our subdomains.
  - `Domain`: Bound to `.techaxon.localhost` (dev) or `.techaxon.de` (prod), allowing apps like `crm.techaxon.de` to automatically attach the authentication cookie without requiring a separate login.