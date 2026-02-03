import { Routes } from '@angular/router';
import { MainLayout } from './core/layout/main-layout';
import { AuthLayout } from './core/auth/layout/auth-layout';
import { Home } from './features/home/home';
import { Login } from './core/auth/pages/login/login';
import { Register } from './core/auth/pages/register/register';
import { VerifyEmail } from './core/auth/verify-email/verify-email';
import { ForgotPassword } from './core/auth/pages/forgot-password/forgot-password';
import { ResetPassword } from './core/auth/pages/reset-password/reset-password';
import { UserProfile } from './core/auth/pages/user-profile/user-profile';
import { AuthGuard } from './core/auth/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            { path: '', component: Home },
            { path: 'user-profile', component: UserProfile, canMatch: [AuthGuard] },
            //   { path: 'profile', component: ProfileComponent },
            // etc...
        ]
    },
    {
        path: '',
        component: AuthLayout,
        children: [
            { path: 'login', component: Login },
            { path: 'register', component: Register },
            { path: 'verify-email', component: VerifyEmail },
            { path: 'forgot-password', component: ForgotPassword },
            { path: 'reset-password', component: ResetPassword },
        ]
    },
    // { path: '**', redirectTo: '' } // fallback
];