import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SignIn } from './sign-in';
import { AuthService } from '../../auth.service';

describe('SignIn', () => {
  let component: SignIn;
  let fixture: ComponentFixture<SignIn>;
  let authService: any;
  let router: any;

  beforeEach(async () => {
    authService = {
      login: vi.fn()
    };
    router = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        SignIn,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatSnackBarModule
      ]
    })
    .overrideComponent(SignIn, {
      set: {
        providers: [
          { provide: AuthService, useValue: authService },
          { provide: Router, useValue: router }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignIn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should validate email field', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBe(true);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.hasError('email')).toBe(false);
  });

  it('should validate password field', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('short');
    expect(passwordControl?.hasError('minlength')).toBe(true);

    passwordControl?.setValue('validpassword');
    expect(passwordControl?.hasError('minlength')).toBe(false);
  });

  it('should prevent spaces in password', () => {
    const passwordControl = component.form.get('password');
    passwordControl?.setValue('has space');
    expect(passwordControl?.hasError('noSpaces')).toBe(true);

    passwordControl?.setValue('nospaces');
    expect(passwordControl?.hasError('noSpaces')).toBe(false);
  });

  it('should show validation errors when submitting empty form', () => {
    // Form is empty by default
    component.onSubmit();
    
    // Form should still be invalid
    expect(component.form.invalid).toBe(true);
    // Snackbar should be called with error message
    // (You can spy on snackBar if needed)
  });

  it('should mark all fields as touched on submit', () => {
    const markAllAsTouchedSpy = vi.spyOn(component.form, 'markAllAsTouched');
    
    component.onSubmit();
    
    expect(markAllAsTouchedSpy).toHaveBeenCalled();
  });

  it('should call login service on valid submit', () => {
    authService.login.mockReturnValue(of(true));

    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('should handle login error', () => {
    authService.login.mockReturnValue(throwError(() => ({ status: 401 })));

    component.form.patchValue({
      email: 'test@example.com',
      password: 'wrong'
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should toggle password visibility', () => {
    expect(component.hidePassword).toBe(true);
    component.togglePassword();
    expect(component.hidePassword).toBe(false);
  });

  it('should load saved email from localStorage', () => {
    localStorage.setItem('remembered_email', 'saved@example.com');
    component.ngOnInit();
    expect(component.form.get('email')?.value).toBe('saved@example.com');
    expect(component.form.get('rememberMe')?.value).toBe(true);
  });
});