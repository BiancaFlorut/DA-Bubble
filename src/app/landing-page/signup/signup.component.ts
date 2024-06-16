import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  public isChecked: boolean = false;
  public showCheckboxFeedback: boolean = false;
  public createdEmail: any[] = [];
  public emailIsExisting: boolean = false;
  public userForm!: FormGroup;

  private user = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.getUsersEmail();
  }

  public getUsersEmail() {
    this.authService.user$.forEach(user => {
      if (user) {
        this.createdEmail.push(user.email);
      }
    });
  }

  public handleCheckbox() {
    this.isChecked = !this.isChecked;
  }

  public addUser() {
    this.emailExisting();
    this.checkCheckbox();
    this.updateAndNavigate();
  }

  private emailExisting() {
    const inputEmail = this.userForm.get('email')?.value;
    if (this.createdEmail.length > 0) {
      const emailExists = this.createdEmail.some(user => user.email === inputEmail);
      if (emailExists) {
        this.emailIsExisting = true;
        setTimeout(() => {
          this.emailIsExisting = false;
        }, 2000);
      }
    }
  }

  private checkCheckbox() {
    if (!this.isChecked) {
      this.showCheckboxFeedback = true;
      setTimeout(() => {
        this.showCheckboxFeedback = false;
      }, 2000);
    }
  }

  private updateAndNavigate() {
    if (this.userForm.valid && this.isChecked && !this.emailIsExisting) {
      this.user.setUser(this.userForm.value);
      this.router.navigate(['/landing-page/signup/choose-avatar']);
    }
  }
}