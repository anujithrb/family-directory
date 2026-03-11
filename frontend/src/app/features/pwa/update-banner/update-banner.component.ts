import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-pwa-update-banner',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div *ngIf="updateAvailable" class="update-banner">
      <mat-icon>system_update</mat-icon>
      <span>New version available!</span>
      <button mat-button (click)="reload()">Reload</button>
    </div>
  `,
  styles: [`
    .update-banner {
      position: fixed; bottom: 80px; left: 16px; right: 16px; z-index: 1000;
      background: #323232; color: white; padding: 8px 16px; border-radius: 4px;
      display: flex; align-items: center; gap: 12px;
    }
    .update-banner span { flex: 1; }
  `],
})
export class PwaUpdateBannerComponent implements OnInit {
  updateAvailable = false;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable = true;
        }
      });
    }
  }

  reload(): void {
    window.location.reload();
  }
}
