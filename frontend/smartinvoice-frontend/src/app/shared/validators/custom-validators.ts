import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** No spaces allowed validator */
export const noSpacesValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string;
  if (value && value.includes(' ')) {
    return { noSpaces: true };
  }
  return null;
};

/** Password strength validator (at least one uppercase, one lowercase, one number, one special char) */
export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string;
  if (!value) return null;
  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
  const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecial;
  return isValid ? null : { weak: true };
};

/** Cross-field password match validator */
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  if (newPassword && confirmPassword && newPassword !== confirmPassword) {
    return { mismatch: true };
  }
  return null;
};

/** Email domain whitelist validator */
export const allowedEmailDomains = (domains: string[]): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value as string;
    if (!email) return null;
    const domain = email.split('@')[1];
    return domains.includes(domain) ? null : { domainNotAllowed: true };
  };
};