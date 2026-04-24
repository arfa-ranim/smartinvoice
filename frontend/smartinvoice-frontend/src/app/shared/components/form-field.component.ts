import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-field">
      <label [for]="id">{{ label }}<span *ngIf="required" class="required-star">*</span></label>
      <input [id]="id" [type]="type" [formControl]="control" [placeholder]="placeholder" class="form-input" />
      <div class="error" *ngIf="control?.invalid && control?.touched">{{ errorMessage }}</div>
    </div>
  `,
  styles: [`.form-field { display: flex; flex-direction: column; gap: 0.5rem; } .required-star { color: #ef4444; margin-left: 4px; }`]
})
export class FormFieldComponent {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() control: any;
  @Input() placeholder = '';
  @Input() required = false;
  @Input() errorMessage = 'This field is required';
}