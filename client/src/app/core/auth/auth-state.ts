import { Injectable, WritableSignal, signal } from "@angular/core";
import { AuthUser } from "./auth-models";

@Injectable({ providedIn: 'root' })
export class AuthState {

  readonly isLoggedIn: WritableSignal<boolean | null> = signal(null);
  readonly currentUser: WritableSignal<AuthUser | null> = signal(null);

  setLogin(user: AuthUser) {
    this.isLoggedIn.set(true);
    this.currentUser.set(user);
  }

  setLogout() {
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
  
  clear() {
    this.isLoggedIn.set(null);
    this.currentUser.set(null);
  }
}
