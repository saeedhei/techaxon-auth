# 🧭 System Overview

This IAM system is a lightweight Identity Provider built using:

- Node.js (NestJS or Express)
- CouchDB (document-based storage)
- OAuth2 / OpenID Connect (OIDC)
- JWT (RS256)

## 🏗 Architecture


app.test.com (Client - Next.js)
↓
iam.test.com (Identity Provider)
↓
CouchDB (IAM Database)


## 🎯 Responsibilities

### Identity Provider (iam.test.com)
- User authentication (login/register)
- Token issuance (JWT)
- OAuth2 / OIDC flows
- Session management
- Client validation

### Client Applications
- Redirect users to IAM
- Handle callback
- Store tokens securely
