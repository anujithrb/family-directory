# ADR-003: Caching and Session Storage

**Date**: 2024-01-01  
**Status**: Accepted

## Context

Need fast key-value storage for JWT revocation (blocklist), rate limit counters, and family tree cache.

## Decision

Use **Redis 7** via **ioredis**.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Memcached | Simple | No persistence; no pub/sub; less data types |
| In-memory (Map) | Zero infra | Lost on restart; not horizontally scalable |
| DynamoDB | Managed | AWS vendor lock-in; overkill for this scale |

## Rationale

- Redis TTL support is perfect for JWT blocklist (tokens expire naturally)
- Atomic increment operations for rate limiting (no race conditions)
- String/JSON storage for family tree cache with `SETEX` TTL
- ioredis: production-ready client with connection pooling and retry logic
