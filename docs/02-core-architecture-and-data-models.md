Here is the complete, highly professional documentation. It perfectly captures
Saeed's microservice architecture, endpoint structures, and the new
techaxon_core database design.

📝 Step 1: Add the Content

Open docs/02-core-architecture-and-data-models.md and paste this exact text:

# TechAxon Core Architecture & Data Models

## 1. Architectural Overview

TechAxon operates on a decoupled, microservice-inspired architecture to ensure scalability, fault tolerance, and independent deployment of sub-applications.

The system is divided into two main layers:

1. **TechAxon Core API (`api.techaxon.com`)**: The "Central Brain" responsible for identity (TechAxon ID), shared financial data (Billing, Invoices), and global access control (Licenses).
2. **App-Specific APIs (e.g., `lms.techaxon.com/api`)**: Isolated APIs that strictly handle operational business logic for their respective domains (e.g., Courses, Tasks, Customers).

This separation ensures that if an operational app goes down, the Core system (and other apps) remain fully functional.

---

## 2. Shared Services (Core API Endpoints)

The Core API serves all TechAxon sub-applications. It exposes the following central service routes:

- **/auth/\*** (Login, Register, Refresh Token, Logout)
- **/users/\*** (Profiles, TechAxon ID Management, Settings)
- **/billing/\*** (Carts, Pricing, Checkout flows)
- **/payments/\*** (Payment Gateway Webhooks, Transactions)
- **/invoices/\*** (Invoice Generation, History)
- **/licenses/\*** (Access Control: `GET /licenses/me`)
- **/products/\*** (List of available SaaS apps and Plans)
- **/notifications/\*** (Global Alerts, Emails, SMS triggers)

---

## 3. Database Strategy

To avoid a monolithic database bottleneck, data is strictly categorized into **Central Financial/Auth Data** and **Isolated Operational Data**.

### 3.1 Central Database: `techaxon_core` (CouchDB)

Because CouchDB is a NoSQL document database, we utilize a **Single-Table Design pattern**. Instead of creating 15 separate databases, all core entities live inside `techaxon_core`. We differentiate them using a strict `type` attribute on every document.

### 3.2 Isolated App Databases

Each sub-application maintains its own distinct database to ensure high performance and easy data migrations.

- **LMS DB**: `courses`, `enrollments`, `assignments`
- **CRM DB**: `customers`, `deals`, `leads`
- **Kanban DB**: `boards`, `tasks`, `columns`

---

## 4. `techaxon_core` Data Models (Schemas)

Below are the primary NoSQL document structures used in the central database.

### 4.1 Users & Sessions

````json
// type: "user"
{
  "_id": "user_123",
  "type": "user",
  "username": "saeed",
  "password": "$2a$10$hashed_password_string",
  "createdAt": "2026-06-09T10:00:00Z"
}

// type: "session"
{
  "_id": "session_abc",
  "type": "session",
  "userId": "user_123",
  "hashedRefreshToken": "$2a$10$hashed_token",
  "deviceInfo": "Chrome / Windows",
  "isValid": true
}

4.2 Products & Licenses (Access Control)

When a user accesses lms.techaxon.com, the LMS API first calls GET
api.techaxon.com/licenses/me. The Core API checks the user's active licenses to
grant or deny access.

// type: "license"
{
  "_id": "license_789",
  "type": "license",
  "userId": "user_123",
  "product": "LMS",
  "plan": "PRO",
  "status": "active",
  "issuedAt": "2026-06-09T12:00:00Z",
  "expiresAt": "2027-06-09T12:00:00Z"
}

4.3 Billing & Invoices

// type: "invoice"
{
  "_id": "inv_456",
  "type": "invoice",
  "userId": "user_123",
  "amount": 99.00,
  "currency": "USD",
  "status": "paid",
  "items": [
    { "productId": "prod_lms", "plan": "PRO", "price": 99.00 }
  ],
  "transactionId": "txn_999",
  "createdAt": "2026-06-09T11:55:00Z"
}


### 🔗 Step 2: Update `README.md`
Go to your `README.md` file, scroll to the bottom "Documentation" section we made earlier, and add the new link so it looks like this:

```markdown
## Documentation

For deep dives into our architectural decisions and implementations, please refer to the `docs/` directory:
- [Authentication Architecture & Security Strategy](./docs/01-authentication-architecture.md)
- [Core Architecture & Central Data Models](./docs/02-core-architecture-and-data-models.md)

💾 Step 3: Commit and Push!

Run these commands in your terminal to save this incredible architectural
layout:

git add .
git commit -m "docs: finalize TechAxon Core microservice architecture and data models

- Documented Core API vs Operational App APIs decoupling strategy.
- Mapped out shared central endpoints (/auth, /billing, /licenses, etc.).
- Outlined database isolation (Central techaxon_core vs isolated app DBs).
- Defined NoSQL Single-Table Design schemas for users, sessions, licenses, and invoices using the 'type' attribute."
git push origin main

🚀 What's Next? (The Code Refactor)

Now that the architecture is documented and approved, we need to update the code
we wrote earlier today!

Right now, our login and register API routes try to save to databases named
users and sessions. We need to change the code so they both save to
techaxon_core. Since we already added type: 'user' and type: 'session' to our
objects in the code, this refactor is going to take 2 minutes!

Let me know when the commit is pushed and you are ready for the refactor!
````
