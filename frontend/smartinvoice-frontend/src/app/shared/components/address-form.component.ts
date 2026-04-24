import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="parentForm">
      <div class="form-grid two-columns">
        <app-form-field id="street" label="Street" formControlName="street" [required]="true"></app-form-field>
        <app-form-field id="city" label="City" formControlName="city" [required]="true"></app-form-field>
        <app-form-field id="postalCode" label="Postal Code" formControlName="postalCode"></app-form-field>
        <app-form-field id="country" label="Country" formControlName="country" [required]="true"></app-form-field>
      </div>
    </div>
  `
})
export class AddressFormComponent {
  @Input() parentForm!: FormGroup;
}