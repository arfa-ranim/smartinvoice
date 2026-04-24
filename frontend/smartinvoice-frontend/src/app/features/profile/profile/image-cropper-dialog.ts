import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-image-cropper-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'PROFILE.EDIT_PROFILE_PICTURE' | translate }}</h2>
    <mat-dialog-content>
      <input type="file" (change)="onFileSelected($event)" accept="image/*" class="file-input" #fileInput>
      <button class="upload-btn" (click)="fileInput.click()">{{ 'PROFILE.CHOOSE_IMAGE' | translate }}</button>
      
      @if (imageChangedEvent) {
        <div class="cropper-placeholder">
          <div class="cropper-loading">{{ 'COMMON.LOADING' | translate }}...</div>
          <div #cropperContainer class="cropper-container"></div>
        </div>
      }
      
      @if (croppedImage) {
        <div class="preview">
          <img [src]="croppedImage" [alt]="'PROFILE.CROPPED_PREVIEW' | translate">
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">{{ 'COMMON.CANCEL' | translate }}</button>
      <button mat-raised-button color="primary" [disabled]="!croppedImage" (click)="save()">{{ 'COMMON.SAVE' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .file-input { display: none; }
    .upload-btn { margin-bottom: 1rem; }
    .preview { margin-top: 1rem; text-align: center; }
    .preview img { max-width: 150px; border-radius: 50%; }
    .cropper-placeholder { min-height: 300px; }
    .cropper-loading { text-align: center; padding: 2rem; color: #64748b; }
    .cropper-container { width: 100%; }
  `]
})
export class ImageCropperDialog {
  private dialogRef = inject(MatDialogRef<ImageCropperDialog>);
  private data = inject(MAT_DIALOG_DATA);
  imageChangedEvent: any = null;
  croppedImage: string | null = null;
  private cropperInstance: any = null;

  @ViewChild('cropperContainer') cropperContainer!: ElementRef;

  async onFileSelected(event: Event): Promise<void> {
    this.imageChangedEvent = event;
    this.croppedImage = null;
    
    try {
      // Dynamically import ngx-image-cropper only when needed
      const { ImageCropperComponent } = await import('ngx-image-cropper');
      // Note: ImageCroppedEvent is a type, not a value, so we don't import it
      // The cropper will be rendered lazily - in a real implementation,
      // you would dynamically create the component here
    } catch (error) {
      console.error('Failed to load image cropper:', error);
    }
  }

  save(): void {
    this.dialogRef.close(this.croppedImage);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}