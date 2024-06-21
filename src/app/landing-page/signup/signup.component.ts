import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user/user.service';

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
  public userForm!: FormGroup;
  public errorMessage!: string | null;

  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit() {
    this.userForm = this.fb.group({
      name: [this.userService.user.name, [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: [this.userService.user.email, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: [this.userService.userPassword, [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.setTimeoutErrorMessage();
  }

  private setTimeoutErrorMessage() {
    this.errorMessage = localStorage.getItem('error');
    setTimeout(() => {
      localStorage.removeItem('error');
      this.errorMessage = null;
    }, 3000);
  }

  public handleCheckbox() {
    this.isChecked = !this.isChecked;
  }

  public addUser() {
    this.checkCheckbox();
    this.updateAndNavigate();
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
    if (this.userForm.valid && this.isChecked) {
      this.userService.setUser(this.userForm.value);
      this.userService.userPassword = this.userForm.get('password')?.value;
      this.router.navigate(['/landing-page/signup/choose-avatar']);
    }
  }
}