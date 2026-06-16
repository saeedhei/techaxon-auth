# Architecture Decision Record (ADR) 03: Migration to NestJS & Core Database Restructuring

**Status:** Approved / Implemented  
**Date:** June 16, 2026  
**Authors:** Hesam

---

## 1. Context & Problem Statement

Initially, the TechAxon Authentication API was built using Next.js App Router API routes. While functional, we encountered three primary architectural bottlenecks as the project scope expanded:

1. **Lack of Structure**: Next.js lacks a built-in dependency injection (DI) container, leading to raw singleton imports for CouchDB and Redis, which limits unit testing and modular upgrades.
2. **Database Fragmentation**: We were maintaining separate databases for `users` and `sessions`. As we plan to add Billing, Products, and Licenses, managing 10+ distinct databases in CouchDB introduces immense overhead.
3. **CouchDB MVCC Conflict (HTTP 409)**: CouchDB's Multi-Version Concurrency Control (MVCC) requires the current revision (`_rev`) string for all document updates. Because our Redis session cache did not store the `_rev` ID returned upon session creation, subsequent token refreshes triggered 409 conflicts.

---

## 2. Decisions Made

### Decision 1: Framework Migration to NestJS

We decided to completely migrate the backend codebase to NestJS.

- **Consequence**: We now have a clean separation of concerns via the **Controller-Service** pattern.
- **Dependency Injection**: Database connections are wrapped inside a global `DatabaseModule` exporting injectable `CouchDbService` and `RedisService` providers.

### Decision 2: Single-Table Design (`techaxon_core`)

We consolidated all core operational and identity data into a single CouchDB database named `techaxon_core`.

- **Consequence**: Entities (Users, Sessions) are now saved inside the same database, distinguished purely by a strict `type` attribute (e.g., `type: "user"`, `type: "session"`). This drastically simplifies backup, replication, and querying overhead.

### Decision 3: Synchronous MVCC `_rev` Caching

To resolve the 409 Update Conflict, we restructured the caching pipeline:

1. When a session is created or updated in CouchDB, the database-generated `_rev` string is immediately captured from the write response.
2. This `_rev` is appended directly to the session object _before_ it is cached in Redis.
3. On subsequent token rotation requests, NestJS pulls the session from Redis (retaining the `_rev`), modifies the token, and pushes the update to CouchDB safely.

---

## 3. Verification & Compliance

- **Validation**: Enforced strict input data validation at the controller layer using NestJS `ValidationPipe` and Class DTOs.
- **Dependency Management**: Standardized the workspace on `pnpm` and updated the development Docker configurations to execute using `pnpm start:dev` to ensure rapid, hot-reloading compilation.
