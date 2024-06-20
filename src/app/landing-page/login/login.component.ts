import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public userForm!: FormGroup;
  public errorMessage!: string;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  public authService = inject(AuthService);
  private userService = inject(UserService);

  ngOnInit() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.userService.resetUser();
  }

  public loginWithGoogle() {
    localStorage.setItem('loggedAsGuestOrGoogleUser', 'logged');
    this.authService.googleSignIn();
  }

  public login() {
    this.authService.login(this.userForm.get('email')?.value, this.userForm.get('password')?.value)
      .subscribe({
        next: (result) => {
          localStorage.setItem('startAnimation', 'false');
          const user = result.user.uid;
          this.router.navigate([`main-page/${user}`]);
        },
        error: error => {
          if (error.code === 'auth/user-not-found') {
            this.errorMessage = 'user-not-found';
          } else if (error.code === 'auth/wrong-password') {
            this.errorMessage = 'wrong-password';
          } else if (error.code === 'auth/too-many-requests') {
            this.errorMessage = 'too-many-requests';
          }
          this.setTimeOutErrorMessage();
        }
      });
  }

  private setTimeOutErrorMessage() {
    setTimeout(() => {
      this.errorMessage = '';
    }, 2000);
  }

  public loginAsGuest() {
    localStorage.setItem('loggedAsGuestOrGoogleUser', 'logged');
    this.router.navigate(['main-page/guest']);
  }
}