import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthGateway } from './auth-gateway';
import { AuthState } from './auth-state';

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  const authGateway = inject(AuthGateway);
  const authState = inject(AuthState);
  const newReq = req.clone({
    withCredentials: true
  });

  return next(newReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      if (
        error.status === HttpStatusCode.Unauthorized &&
        !req.url.endsWith('/login') &&
        !req.url.endsWith('/register') &&
        !req.url.endsWith('/token/refresh') &&
        !req.url.endsWith('/verify/resend')
      ) {
        
        return authGateway.refreshToken().pipe(
          switchMap(() => {
            return next(newReq);
          }),
          catchError(err => {
            if (authState.isLoggedIn()) {
              authGateway.logout().subscribe();
            }
            return throwError(() => err);
          })
        );
      }

      return throwError(() => error);
    })
  );
}