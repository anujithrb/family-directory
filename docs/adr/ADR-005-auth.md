# ADR-005: Authentication Strategy

**Date**: 2024-01-01  
**Status**: Accepted

## Context

Need authentication for a private family app with role-based access control (ADMIN, USER, READ_ONLY) and per-user permissions.

## Decision

Use **JWT access tokens** (15 min) + **refresh tokens** (7 days, httpOnly cookie) + **Redis blocklist** for revocation.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Session-based (express-session) | Simple revocation | Requires sticky sessions; not stateless |
| OAuth2 (Google/GitHub) | No password management | Requires external provider; family privacy |
| Passkeys/WebAuthn | Phishing-resistant | Complex implementation; limited browser support |
| Long-lived JWT only | Simple | Cannot revoke; security risk |

## Rationale

- Short-lived access tokens (15 min) limit exposure from token theft
- Refresh tokens in httpOnly cookie prevent XSS access
- Redis blocklist allows immediate revocation on logout without database queries
- RBAC enforced server-side on every request (not just JWT claims)
- `UserPermission` table allows fine-grained per-user permission grants

## Rollback

If the Redis blocklist becomes unavailable, the system degrades gracefully: access tokens remain valid until expiry (max 15 min). Refresh tokens are still validated against PostgreSQL.
