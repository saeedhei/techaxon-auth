# 📄 6. `security-model.md`

```md
# 🔐 Security Model

This IAM system follows modern OAuth2/OIDC security practices.

---

## 🔑 Passwords

- Stored using Argon2
- Never stored in plain text

---

## 🎟 Tokens

### Access Token
- JWT (RS256)
- Short-lived (5–15 min)

### Refresh Token
- Stored hashed
- Rotated on every use

---

## 🧠 PKCE

Required for all public clients:

- code_challenge
- code_verifier

---

## 🛡 Protection Layers

- Rate limiting
- Brute-force protection
- Account lockout
- Email verification required
- Audit logging

---

## 📜 Audit Logs

All sensitive actions are logged:

- login
- logout
- token refresh
- password reset
