import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ios-install-modal',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Install Family Directory</h2>
    <mat-dialog-content>
      <ol>
        <li>Tap the <mat-icon style="vertical-align:middle">ios_share</mat-icon> Share button in Safari</li>
        <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
        <li>Tap <strong>Add</strong> in the top right corner</li>
      </ol>
      <p>The app will open full-screen without the browser toolbar.</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Got it</button>
    </mat-dialog-actions>
  `,
})
export class IosInstallModalComponent {}
