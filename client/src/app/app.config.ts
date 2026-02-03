import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HttpClient, HttpResponse, HttpStatusCode, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/auth/auth-interceptor';
import { catchError, firstValueFrom, Observable, of, tap, throwError } from 'rxjs';
import { AuthState } from './core/auth/auth-state';
import { AuthUser } from './core/auth/auth-models';
import { environment } from '../environments/environment';
import { AuthGateway } from './core/auth/auth-gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    provideAppInitializer(async () => {
      
      const apiUrl = environment.apiUrl;
      const http = inject(HttpClient);
      const authState = inject(AuthState);
      const authGateway = inject(AuthGateway);
      
      return firstValueFrom(
        http.get<AuthUser>(`${apiUrl}/me`, { withCredentials: true, observe: 'response' })
        .pipe(
          tap({
          next: (response) => {
            authGateway.apiStatus.set(true);
            authState.setLogin(response.body!)
          },
        }),
        catchError((err) => {
          if (err.status) {
            switch (err.status) {
              case HttpStatusCode.Unauthorized:
                authState.setLogout();
              break;
              default:
                authGateway.apiStatus.set(false);
                authState.setLogout();
              break;
            }
          } else {
            authState.clear();
          }
          return of(null); // on résout quand même pour permettre le bootstrap
        })
      ));
    }),
  ],
}
