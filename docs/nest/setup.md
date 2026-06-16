# NestJS Auth Core Service Setup Guide

This document outlines the setup, architecture, and deployment procedures for the migrated NestJS Core Authentication API [2].

## 1. Local Development Installation

### Prerequisites
- Node.js (v20+)
- `pnpm` (Enforced package manager)
- Docker & Docker Compose

### Step-by-Step Setup
1. **Install Dependencies**:
   ```bash
   pnpm install
   ```
2. **Environment Configuration**: Ensure your `.env` contains the correct database and Redis connection keys.
3. **Start the Dev Container Stack**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```

## 2. Code Architecture & Dependency Injection (DI)

We moved from Next.js API Routes to NestJS to leverage a highly maintainable Dependency Injection architecture:

- **DatabaseModule**: A global module wrapping our `CouchDbService` (nano) and `RedisService` (ioredis) [2]. These are exposed as NestJS providers [2].
- **AuthModule**: Injects the global Database Services. By decoupling database connection layers, we can easily swap our database layer in the future without modifying Auth controllers.
- **AuthController**: Handles standard express-based HTTP routing, Validation pipes (DTO), and cookie manipulation.
- **AuthService**: Houses the strict security business logic (Bcrypt, JWT signing, MVCC CouchDB revision checks, Token Rotation, and session validation).

## 3. Verifying Endpoint Services

Use the following cURL commands to verify that the local environment is operational:

**Register a User**
```bash
curl -X POST http://localhost:3000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"username": "saeed", "password": "password123"}'
```

**Log in (Sets Secure Cookie)**
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"username": "saeed", "password": "password123"}'
```