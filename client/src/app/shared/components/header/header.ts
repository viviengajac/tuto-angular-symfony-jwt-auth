import { Component, inject, WritableSignal } from '@angular/core';
import { throwError } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../core/auth/auth-models';
import { AuthGateway } from '../../../core/auth/auth-gateway';
import { AuthState } from '../../../core/auth/auth-state';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  
  constructor(protected authState: AuthState, private authGateway: AuthGateway, private router: Router) {}

  public logout(): void {
    this.authGateway.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => throwError(() => new Error(err)),
    });
  }
}
