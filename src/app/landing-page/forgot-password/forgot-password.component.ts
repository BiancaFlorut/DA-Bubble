import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  public validEmail!: boolean;
  public userForm!: FormGroup;
  public errorMessage!: string;
  public showSendEmailMessage: boolean = false;

  private router: Router = inject(Router);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]]
    });
  }

  public async sendPasswordResetEmail() {
    const email = this.userForm.get('email')?.value;
    if (email) {
      await this.authService.sendPasswordReset(email)
        .then(() => {
          this.showEmailSentMessage();
        })
        .catch(error => {
          if (error.code === 'auth/user-not-found') {
            this.errorMessage = 'user-not-found';
          }
          this.setTimeOutErrorMessage();
        });
    }
  }

  private setTimeOutErrorMessage() {
    setTimeout(() => {
      this.errorMessage = '';
    }, 2000);
  }

  private showEmailSentMessage() {
    this.showSendEmailMessage = true;
    setTimeout(() => {
      this.showSendEmailMessage = false;
      this.router.navigate(['./landing-page/login']);
    }, 2000);
  }
}
