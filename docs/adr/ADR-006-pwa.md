# ADR-006: Progressive Web App Strategy

**Date**: 2024-01-01  
**Status**: Accepted

## Context

The app should work offline, be installable on mobile devices, and provide a native-like experience.

## Decision

Use **@angular/service-worker** with a custom `ngsw-config.json` caching strategy.

## Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| Workbox directly | More control | Not zone-aware; conflicts with Angular's change detection |
| No PWA | Simplicity | Poor mobile experience; no offline support |
| Capacitor/Cordova | Full native | App store publishing complexity; overkill |

## Rationale

- `@angular/service-worker` is Angular's recommended approach — integrates with zone.js
- `ngsw-config.json` declarative config: no custom SW code needed
- Freshness strategy for API data (prefer network, fall back to cache)
- Performance strategy for static assets and photos (serve from cache)
- `ngsw-worker.js` served with `Cache-Control: no-cache` to ensure updates are detected immediately
- Auth endpoints use `maxAge: 0s` to prevent stale credential caching
