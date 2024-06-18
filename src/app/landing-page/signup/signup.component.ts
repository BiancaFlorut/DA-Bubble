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

  private user = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit() {
    this.userForm = this.fb.group({
      name: [this.user.user.name, [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: [this.user.user.email, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: [this.user.user.password, [Validators.required, Validators.pattern(/^.{8,}$/)]]
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
      this.user.setUser(this.userForm.value);
      this.router.navigate(['/landing-page/signup/choose-avatar']);
    }
  }
}