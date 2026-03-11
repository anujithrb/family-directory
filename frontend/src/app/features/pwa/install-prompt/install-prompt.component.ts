import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-pwa-install-prompt',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div *ngIf="showPrompt" class="install-banner">
      <mat-icon>install_mobile</mat-icon>
      <span>Add Family Directory to your home screen!</span>
      <button mat-button color="accent" (click)="install()">Install</button>
      <button mat-icon-button (click)="dismiss()"><mat-icon>close</mat-icon></button>
    </div>
    <div *ngIf="showIosPrompt" class="ios-banner">
      <mat-icon>ios_share</mat-icon>
      <span>Tap <strong>Share</strong> then <strong>Add to Home Screen</strong></span>
      <button mat-icon-button (click)="dismissIos()"><mat-icon>close</mat-icon></button>
    </div>
  `,
  styles: [`
    .install-banner, .ios-banner {
      position: fixed; top: 64px; left: 0; right: 0; z-index: 1000;
      background: #1a73e8; color: white; padding: 8px 16px;
      display: flex; align-items: center; gap: 12px;
    }
    .install-banner span, .ios-banner span { flex: 1; }
  `],
})
export class PwaInstallPromptComponent implements OnInit {
  showPrompt = false;
  showIosPrompt = false;
  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  ngOnInit(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showPrompt = true;
    });

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
    if (isIos && !isStandalone && !localStorage.getItem('ios-install-dismissed')) {
      setTimeout(() => { this.showIosPrompt = true; }, 3000);
    }
  }

  async install(): Promise<void> {
    if (!this.deferredPrompt) return;
    await this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.showPrompt = false;
    }
    this.deferredPrompt = null;
  }

  dismiss(): void {
    this.showPrompt = false;
    this.deferredPrompt = null;
  }

  dismissIos(): void {
    this.showIosPrompt = false;
    localStorage.setItem('ios-install-dismissed', '1');
  }
}
