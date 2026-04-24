import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Simuler une vérification d'authentification via localStorage
    const isLoggedIn = localStorage.getItem('fake_token') === 'true';

    if (isLoggedIn) {
      return true;
    }

    // Rediriger vers la page de connexion
    this.router.navigate(['/auth/sign-in']);
    return false;
  }
}