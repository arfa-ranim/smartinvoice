import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreateClient } from './create-client';
import { ClientService } from '../../../core/services/client.service';

describe('CreateClient', () => {
  let component: CreateClient;
  let fixture: ComponentFixture<CreateClient>;
  let clientService: any;
  let router: any;

  beforeEach(async () => {
    clientService = {
      addClient: vi.fn().mockReturnValue(of({ id: '123', name: 'Test Client' }))
    };
    router = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        CreateClient,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
      ]
    })
    .overrideComponent(CreateClient, {
      set: {
        providers: [
          { provide: ClientService, useValue: clientService },
          { provide: Router, useValue: router }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateClient);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.clientForm.valid).toBe(false);
  });

  it('should validate required fields', () => {
    const fullNameControl = component.clientForm.get('fullName');
    expect(fullNameControl?.hasError('required')).toBe(true);
  });

  it('should validate email format', () => {
    const emailControl = component.clientForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should submit form when valid', () => {
    component.clientForm.patchValue({
      fullName: 'Test Client',
      email: 'test@example.com',
      phone: '+1234567890',
      companyName: 'Test Corp',
      street: '123 Test St',
      city: 'Test City',
      country: 'United States'
    });

    component.saveClient();

    expect(clientService.addClient).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
  });

  it('should cancel and navigate back', () => {
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/clients']);
  });
});