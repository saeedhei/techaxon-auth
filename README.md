# TechAxon Auth

API-first authentication system for web and mobile applications, designed for secure, scalable, and cross-platform identity management.

---

## Overview

This authentication system is based on a modern token architecture supporting:

- Short-lived JWT access tokens (15 min TTL)
- Secure refresh token rotation (stored hashed in database)
- One active refresh token per device/session
- Device-aware session management
- Full session control (list, revoke, logout per device)

---

## Core Features

- Stateless authentication using JWT
- Secure refresh token rotation
- Multi-device session tracking
- Session revocation with immediate token invalidation
- Cross-platform support (Next.js, React Native, Flutter)

---

## API Design

All endpoints are designed for API-first usage:

- `Authorization: Bearer <access_token>`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET  /auth/sessions`

---

## Architecture Overview

This system is designed to support both standalone applications and multi-application SaaS platforms.

### SSO (Single Sign-On)

In a Next.js-based monolithic or modular architecture, this system supports Single Sign-On (SSO) across multiple subdomains.

Example flow:

Login at:
https://techaxon.de
        ↓
Authentication cookie set on:
Domain = .techaxon.de
        ↓
User is automatically authenticated across all sub-apps:

- kanban.techaxon.de → authenticated
- crm.techaxon.de → authenticated
- lms.techaxon.de → authenticated

---

## Data Storage

CouchDB is used only as a persistence layer for:

- Users
- Sessions

No authentication logic is handled by the database layer.

---

## Security Model

- Access tokens are short-lived and stateless
- Refresh tokens are hashed and rotated on every use
- Sessions are device-based and can be revoked individually
- Compromised sessions can be invalidated immediately

---

## Technology Stack & Architecture Implementation

To achieve the secure, offline-first, and SSO-ready requirements, we have implemented the following stack:

- **Traefik (v3)**: Acts as our API Gateway and Reverse Proxy. 
  - *Dev*: Routes `*.techaxon.localhost` domains to Next.js for local SSO testing without SSL.
  - *Prod*: Enforces HTTPS (Let's Encrypt), routes real domains (`*.techaxon.de`), and secures the internal Docker network.
- **Next.js (App Router)**: The core Authentication Microservice. It serves the UI and the API. Crucially, it acts as a **Secure Proxy** for CouchDB, ensuring database credentials and the CouchDB REST API are never exposed to the frontend.
- **Apache CouchDB**: Our persistent data layer. It stores `Users` and `Sessions` (including hashed refresh tokens). It is locked down in the internal Docker network and only accepts requests from the Next.js backend.
- **Redis**: Used for ultra-fast session lookups, tracking refresh token rotation, and blacklisting revoked tokens.
- **PouchDB (Frontend)**: Handles offline-first capabilities (e.g., the Quiz module). It syncs locally when offline and pushes to CouchDB *through the Next.js secure proxy* when the connection is restored.

## Notes

This system is designed with future scalability in mind and can evolve into a microservice-based architecture with an API gateway if needed.
## Documentation

For deep dives into our architectural decisions and implementations, please refer to the `docs/` directory:
- [Authentication Architecture & Security Strategy](./docs/01-authentication-architecture.md)

## 📚 IAM Documentation (CouchDB-based Identity Provider)

<details>
  <summary>📁 Architecture</summary>

- [System Overview](./docs/Architecture/system-overview.md)
- [Data Model](./docs/Architecture/data-model.md)
- [API Architecture](./docs/Architecture/api-architecture.md)
- [CouchDB Schema](./docs/Architecture/couchdb-schema.md)
- [Security Model](./docs/Architecture/security-model.md)
- [OAuth2 / OIDC Flow](./docs/Architecture/oauth-oidc-flow.md)

</details>
