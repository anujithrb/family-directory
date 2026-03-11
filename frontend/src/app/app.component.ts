import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from './core/store/auth/auth.selectors';
import { PwaInstallPromptComponent } from './features/pwa/install-prompt/install-prompt.component';
import { PwaUpdateBannerComponent } from './features/pwa/update-banner/update-banner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    CommonModule,
    PwaInstallPromptComponent,
    PwaUpdateBannerComponent,
  ],
  template: `
    <app-pwa-install-prompt />
    <app-pwa-update-banner />

    <ng-container *ngIf="isAuthenticated$ | async">
      <mat-toolbar color="primary" class="app-toolbar">
        <span>Family Directory</span>
        <span class="spacer"></span>
        <a mat-icon-button routerLink="/profile">
          <mat-icon>account_circle</mat-icon>
        </a>
      </mat-toolbar>

      <nav class="bottom-nav">
        <a routerLink="/directory" routerLinkActive="active">
          <mat-icon>people</mat-icon>
          <span>Directory</span>
        </a>
        <a routerLink="/tree" routerLinkActive="active">
          <mat-icon>account_tree</mat-icon>
          <span>Tree</span>
        </a>
        <a routerLink="/calendar" routerLinkActive="active">
          <mat-icon>calendar_month</mat-icon>
          <span>Calendar</span>
        </a>
        <a routerLink="/profile" routerLinkActive="active">
          <mat-icon>person</mat-icon>
          <span>Profile</span>
        </a>
      </nav>
    </ng-container>

    <main class="content-with-bottom-nav">
      <router-outlet />
    </main>
  `,
  styles: [`
    .spacer { flex: 1; }
    .app-toolbar { position: sticky; top: 0; z-index: 100; }
    main { min-height: calc(100vh - 64px); }
  `],
})
export class AppComponent implements OnInit {
  isAuthenticated$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }
}
