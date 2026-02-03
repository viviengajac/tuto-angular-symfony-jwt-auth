import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthState } from './core/auth/auth-state';
import { AuthGateway } from './core/auth/auth-gateway';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(protected authGateway: AuthGateway, protected authState: AuthState) {}
}
