import { Routes } from '@angular/router';
import { SignupComponent } from './landing-page/signup/signup.component';
import { LoginComponent } from './landing-page/login/login.component';
import { ImprintComponent } from './landing-page/imprint/imprint.component';
import { ForgotPasswordComponent } from './landing-page/forgot-password/forgot-password.component';
import { PrivacyPolicyComponent } from './landing-page/privacy-policy/privacy-policy.component';
import { ChangePasswordComponent } from './landing-page/change-password/change-password.component';
import { ChooseAvatarComponent } from './landing-page/choose-avatar/choose-avatar.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MainPageComponent } from './main-page/main-page.component';

export const routes: Routes = [
    { path: '', redirectTo: 'landing-page/login', pathMatch: 'full' },
    {
        path: 'landing-page',
        component: LandingPageComponent,
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
    { path: 'main-page', redirectTo: 'main-page/:id', pathMatch: 'full' },
    { path: 'main-page/:id', component: MainPageComponent },
    { path: 'main-page/:id/:cid', component: MainPageComponent }
];
