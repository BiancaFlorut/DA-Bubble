import { Routes } from '@angular/router';
import { IntroComponent } from './intro/intro.component';
import { AuthComponent } from './auth/auth.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { ImprintComponent } from './auth/imprint/imprint.component';
import { PrivacyPoliceComponent } from './auth/privacy-police/privacy-police.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';

export const routes: Routes = [
    { path: '', component: IntroComponent },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'login/forgot-password', component: ForgotPasswordComponent },
            { path: 'signup', component: SignupComponent },
            { path: 'imprint', component: ImprintComponent },
            { path: 'privacy-policy', component: PrivacyPoliceComponent },
        ]
    },
];
