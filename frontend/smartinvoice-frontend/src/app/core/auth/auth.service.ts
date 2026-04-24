import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, delay } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'fake_token';
  private isAuthenticatedSignal = signal<boolean>(false);

  constructor(private router: Router) {
    this.isAuthenticatedSignal.set(this.hasValidToken());
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    return token === 'true';
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  login(email: string, password: string): Observable<boolean> {
    // Simulate login
    if (email && password) {
      localStorage.setItem(this.TOKEN_KEY, 'true');
      this.isAuthenticatedSignal.set(true);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  register(email: string, password: string, name: string): Observable<{ success: boolean; message?: string }> {
    // Simulate registration
    console.log('Registering user', { email, name });
    // In real app, call API
    return of({ success: true, message: 'Registration successful' }).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/sign-in']);
  }
}