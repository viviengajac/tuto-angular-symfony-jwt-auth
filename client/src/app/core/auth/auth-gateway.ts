import { HttpClient, HttpResponse, HttpStatusCode } from "@angular/common/http";
import { Injectable, signal, WritableSignal } from "@angular/core";
import { catchError, firstValueFrom, from, map, Observable, of, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment";
import { LoginPayload, AuthUser, ApiAuthResponse, RegisterPayload, VerifyEmailResponse, PasswordPayload } from "./auth-models";
import { AuthState } from "./auth-state";
import { Params } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class AuthGateway {

    public apiStatus: WritableSignal<boolean> = signal(true);
    private apiUrl = environment.apiUrl;

    constructor(private authState: AuthState, private http: HttpClient) {}

    public login(payload: LoginPayload): Observable<HttpResponse<AuthUser>> {
        return this.http.post<AuthUser>(
            `${this.apiUrl}/login_check`,
            payload,
            {
                withCredentials: true,
                observe: 'response'
            }
            ).pipe(
            tap({
                next: (response) => {
                    if (response.status === HttpStatusCode.Ok) {
                        this.authState.setLogin(response.body!)
                    }
                },
                error: (err) => {
                    if (err.status === HttpStatusCode.Forbidden) {
                        this.authState.setLogin(err.body)
                    }
                    throwError(() => new Error(err))
                },
            })
        );
    }

    public logout(): Observable<void> {
        return this.http.post<void>(
          `${this.apiUrl}/logout`,
          {
            withCredentials: true,
            observe: 'response'
          }
        ).pipe(
          tap({
            next: () => this.authState.setLogout(),
          })
        );
    }

    public register(payload: RegisterPayload): Observable<HttpResponse<void>> {
        return this.http.post<void>(
            `${this.apiUrl}/register`,
            payload,
            { withCredentials: true, 
                observe: 'response' }
        ).pipe(
            tap({
                next: (response) => {
                return response;
                },
                error: (err) => throwError(() => new Error(err)),
            })
        );
    }

    /* JWT */
    public checkAuth(): Observable<boolean> {
        // si on a déjà une valeur connue, inutile d’appeler le backend
        if (this.authState.isLoggedIn()) {
            console.log('guard', this.authState.isLoggedIn());
            // return of(this.authState.isLoggedIn());
            return of(true);
        }

        // sinon on interroge /me
        return this.http.get<AuthUser>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
            tap(user => {
                console.log('a', user)
                this.authState.isLoggedIn.set(true);
                this.authState.currentUser.set(user);
                return of(true);
            }),
            map(() => true),
            catchError(() => {
                this.authState.isLoggedIn.set(false);
                this.authState.currentUser.set(null);
                return of(true);
            })
        );
    }

    public refreshToken(): Observable<void> {
        return this.http.post<void>(
            `${this.apiUrl}/token/refresh`,
            {
            withCredentials: true,
            observe: 'reponse'
            }
        );
        /* .pipe(
            tap({
            // next: () => this.isLoggedIn.set(true),
            // error: (err) => {this.isLoggedIn.set(false), throwError(() => new Error(err)) },
            })
        ); */
    }
    /* JWT */

    /* USER PROFILE */
    public changeEmail(payload: LoginPayload) {
        return this.http.post<ApiAuthResponse>(
            `${this.apiUrl}/user/profile/change/email`,
            payload,
            { withCredentials: true }
        );
    }

    public changePassword(payload: PasswordPayload) {
        return this.http.post<ApiAuthResponse>(
            `${this.apiUrl}/user/profile/change/password`,
            payload,
            { withCredentials: true }
        );
    }
    /* USER PROFILE */

    /* FORGOT PASSWORD */
    public requestResetPassword(email: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/forgot-password/request`, { email });
    }

    public validateResetPasswordToken(token: string): Observable<{ valid: boolean, reason?: string }> {
        return this.http.get<{ valid: boolean, reason?: string }>(`${this.apiUrl}/forgot-password/validate?token=${token}`);
    }

    public resetPassword(token: string, payload: PasswordPayload): Observable<{ success: boolean }> {
        return this.http.post<{ success: boolean }>(`${this.apiUrl}/forgot-password/reset`, {
            token,
            payload
        });
    }
    /* FORGOT PASSWORD */

    /* MAILER */
    public verifyEmail(params: Params): Observable<VerifyEmailResponse> {
        const query = new URLSearchParams(params as Record<string, string>).toString();

        return this.http.get<VerifyEmailResponse>(
            `${this.apiUrl}/verify/email?${query}`,
            { withCredentials: true }
        );
    }

    public resendVerificationEmail(): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(
            `${this.apiUrl}/verify/resend`,
            { email: this.authState.currentUser() },
            { withCredentials: true }
        );
    }
    /* MAILER */
}
