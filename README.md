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

## Notes

This system is designed with future scalability in mind and can evolve into a microservice-based architecture with an API gateway if needed.
