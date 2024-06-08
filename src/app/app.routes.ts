import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { ImprintComponent } from './auth/imprint/imprint.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { PrivacyPolicyComponent } from './auth/privacy-policy/privacy-policy.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { ChooseAvatarComponent } from './auth/choose-avatar/choose-avatar.component';


export const routes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: 'auth',
        component: AuthComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginComponent },
            { path: 'login/forgot-password', component: ForgotPasswordComponent },
            { path: 'login/change-password', component: ChangePasswordComponent },
            { path: 'signup', component: SignupComponent },
            { path: 'signup/choose-avatar', component: ChooseAvatarComponent },
            { path: 'imprint', component: ImprintComponent },
            { path: 'privacy-policy', component: PrivacyPolicyComponent },
        ]
    },
];
