import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
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
  public emailSent: boolean = false;
  public errorMessage: string = '';
  public showSendEmailMessage: boolean = false;

  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]]
    });
  }

  public sendPasswordResetEmail() {
    const email = this.userForm.get('email')?.value;
    if (email) {
      this.authService.sendPasswordReset(email).subscribe({
      next: () => {
        this.emailSent = true;
        this.errorMessage = '';
        this.showEmailSentMessage();
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.emailSent = false;
      }
    });
  }
  }

  // private saveEmailId() {
  //   this.createdUser.forEach(user => {
  //     if (user.email === this.userData.email) {
  //       this.userData.message = `Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:<br><br>https://da-bubble.vitalij-schwab.com/landing-page/login/change-password/${user.id}`;
  //     }
  //   })
  // }

  // private submitForm(ngForm: NgForm) {
  //   this.http.post(this.post.endPoint, this.post.body(this.userData))
  //     .subscribe({
  //       next: (response) => {
  //         ngForm.resetForm();
  //       },
  //       error: (error) => {
  //         console.error(error);
  //       },
  //       complete: () => console.info('send post complete'),
  //     });
  // }

  private showEmailSentMessage() {
    this.showSendEmailMessage = true;
    setTimeout(() => {
      this.showSendEmailMessage = false;
      this.router.navigate(['./landing-page/login'])
    }, 2000);
  }
}
