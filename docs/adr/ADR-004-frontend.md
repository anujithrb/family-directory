# ADR-004: Frontend Framework

**Date**: 2024-01-01  
**Status**: Accepted

## Context

Need a frontend framework for a PWA with complex state management (auth, members, tree, events), lazy-loaded routes, and mobile-first UX.

## Decision

Use **Angular 19** with standalone components, **NgRx** store, and **Angular Material** UI.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| React + Redux | Flexibility | More boilerplate; no built-in routing/forms |
| Vue 3 + Pinia | Simpler | Smaller ecosystem; less enterprise tooling |
| Next.js | SSR/SSG | Overkill; SSR not needed for private family app |
| SvelteKit | Small bundle | Less mature; team unfamiliar |

## Rationale

- Angular 19 standalone components: no NgModule boilerplate
- Built-in `@angular/service-worker` for PWA (Workbox-based, zone-aware)
- NgRx provides predictable state management with DevTools
- Angular Material: consistent, accessible UI components with theming
- `provideHttpClient(withInterceptors([...]))` enables functional interceptors (no class boilerplate)
- Lazy-loaded routes reduce initial bundle size
