import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { onSnapshot } from '@angular/fire/firestore';

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
  public createdUser!: any[];
  public emailIsExisting: boolean = false;
  public userForm!: FormGroup;

  private user = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private firebase = inject(FirebaseService);

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.getUser();
  }

  public getUser() {
    return onSnapshot(this.firebase.getUsers(), (users) => {
      this.createdUser = [];
      users.forEach((user) => {
        this.createdUser.push(user.data());
      });
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
    this.createdUser.forEach(user => {
      if (user.email === this.userForm.get('email')?.value) {
        this.emailIsExisting = true;
        setTimeout(() => {
          this.emailIsExisting = false;
        }, 2000);
      }
    });
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
      this.updateUserDetails();
      this.router.navigate(['/landing-page/signup/choose-avatar'])
    }
  }

  private updateUserDetails() {
    this.user.user = {
      name: this.userForm.get('name')?.value,
      email: this.userForm.get('email')?.value,
      password: this.userForm.get('password')?.value,
      avatar: ''
    }
  }
}