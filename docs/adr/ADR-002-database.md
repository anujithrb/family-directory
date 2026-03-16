# ADR-002: Database Selection

**Date**: 2024-01-01  
**Status**: Accepted

## Context

Need a persistent database for family member data, relationships, events, and user accounts with strong relational integrity.

## Decision

Use **PostgreSQL 16** with **Prisma 5 ORM**.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| MySQL 8 | Widely used | Weaker JSON support; less feature-rich |
| MongoDB | Flexible schema | Relational data (family tree) maps poorly to documents |
| SQLite | Zero config | Not suitable for multi-container production |
| Drizzle ORM | Lightweight | Less mature than Prisma; fewer integrations |

## Rationale

- PostgreSQL: best relational integrity, advanced query capabilities, excellent JSON support
- Prisma: type-safe queries, migration tooling, excellent TypeScript integration
- Schema-first with `prisma migrate` provides auditable migration history
- Prisma 5 supports `cuid()` as default IDs — globally unique without sequences

## Managed Database Hosting

The Prisma schema is configured with both a `url` (connection-pooler URL) and a `directUrl` (direct connection URL). This dual-URL pattern enables compatibility with managed PostgreSQL services such as **Supabase**, which routes regular application queries through PgBouncer but requires a direct connection for schema migrations.

For self-hosted deployments both variables can point to the same PostgreSQL instance. See `hosting-plan.md` — *Supabase Free Tier* section for full setup instructions.
