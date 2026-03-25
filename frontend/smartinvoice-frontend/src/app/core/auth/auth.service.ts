import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * LOGIN METHOD (Mock / Fake implementation)
   * -----------------------------------------
   * This function simulates a login request.
   *
   * @param data - contains user credentials (email, password, etc.)
   *
   * What it does:
   * - Instead of calling a real backend API,
   *   it immediately returns the same data using RxJS `of()`
   *
   * Why `of()`?
   * - `of()` creates an Observable that emits the value instantly
   * - Useful for testing frontend without a backend
   *
   * ⚠️ IMPORTANT:
   * This is NOT real authentication.
   * It does not validate credentials or connect to a server.
   */
  login(data: any) {
    return of(data);
  }

  /**
   * REGISTER METHOD (Mock / Fake implementation)
   * --------------------------------------------
   * This function simulates a user registration request.
   *
   * @param data - contains user registration info (name, email, password, etc.)
   *
   * What it does:
   * - Returns the same data instantly using `of()`
   * - No real API call is made
   *
   * ⚠️ IMPORTANT:
   * This is only for frontend testing purposes.
   * A real app would send this data to a backend server.
   */
  register(data: any) {
    return of(data);
  }
}