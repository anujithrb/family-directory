import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideServiceWorker } from '@angular/service-worker';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './core/store/auth/auth.reducer';
import { membersReducer } from './core/store/members/members.reducer';
import { treeReducer } from './core/store/tree/tree.reducer';
import { eventsReducer } from './core/store/events/events.reducer';
import { AuthEffects } from './core/store/auth/auth.effects';
import { MembersEffects } from './core/store/members/members.effects';
import { TreeEffects } from './core/store/tree/tree.effects';
import { EventsEffects } from './core/store/events/events.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    ),
    provideAnimationsAsync(),
    provideStore({
      auth: authReducer,
      members: membersReducer,
      tree: treeReducer,
      events: eventsReducer,
    }),
    provideEffects([AuthEffects, MembersEffects, TreeEffects, EventsEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
