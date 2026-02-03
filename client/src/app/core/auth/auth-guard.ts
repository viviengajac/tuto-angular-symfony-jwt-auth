import { Injectable } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthState } from './auth-state';

@Injectable({ providedIn: 'root' })
export class AuthGuard {

  constructor(private authState: AuthState, private router: Router) {}

  canMatch: CanMatchFn = () => {

    switch (this.authState.isLoggedIn()) {
      case true:
        return true;

      case false:
        return this.router.navigate(['/login']);

      default:
        return this.router.navigate(['/login']);
    }

  };
}