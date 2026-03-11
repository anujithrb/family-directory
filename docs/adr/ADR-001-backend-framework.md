# ADR-001: Backend Framework Selection

**Date**: 2024-01-01  
**Status**: Accepted

## Context

We need a backend framework for a family directory web application serving ~50–500 users with RESTful APIs, authentication, and file upload capabilities.

## Decision

Use **Node.js 22 LTS + Express 5 + TypeScript 5** (strict mode).

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| NestJS | Built-in DI, modules, decorators | Heavy overhead for small app; learning curve |
| Fastify | Faster than Express | Less middleware ecosystem; team unfamiliar |
| Python/Django | Batteries included | Different language from frontend; slower startup |
| Go/Gin | Performance | Team expertise in TypeScript; slower development |

## Rationale

- Express 5 (stable as of 2024) adds native async error handling — eliminates `try/catch` boilerplate
- TypeScript strict mode catches bugs at compile time
- Largest middleware ecosystem (multer, rate-limit, helmet, etc.)
- Team has TypeScript expertise → consistent language across stack
- Sufficient performance for the scale (50–500 users)
