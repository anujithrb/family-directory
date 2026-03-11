import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-offline-page',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <div class="offline-container">
      <mat-icon class="offline-icon">wifi_off</mat-icon>
      <h1>You're Offline</h1>
      <p>Check your connection and try again. Cached data may still be available.</p>
      <button mat-raised-button color="primary" routerLink="/directory">
        Try Cached Directory
      </button>
    </div>
  `,
  styles: [`
    .offline-container {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh; gap: 16px;
      text-align: center; padding: 32px;
    }
    .offline-icon { font-size: 72px; width: 72px; height: 72px; color: rgba(0,0,0,0.4); }
  `],
})
export class OfflinePageComponent {}
