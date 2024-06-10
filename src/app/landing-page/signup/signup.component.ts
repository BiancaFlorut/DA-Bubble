import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { User } from '../../interfaces/user';
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
  private newUser: User = {
    name: '',
    email: '',
    password: '',
    avatar: '',
  }

  public isChecked: boolean = false;
  public showCheckboxFeedback: boolean = false;
  public createdUser!: any[];
  public emailIsExisting: boolean = false;

  public userForm!: FormGroup;

  constructor(
    private user: UserService,
    private fb: FormBuilder,
    private router: Router,
    private firebase: FirebaseService
  ) { }

  ngOnInit() {
    this.userForm = this.fb.group({
      name: [this.newUser.name, [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: [this.newUser.email, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: [this.newUser.password, [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.getUser();
  }

  public handleCheckbox() {
    this.isChecked = !this.isChecked;
  }

  public addUser() {
    this.newUser = this.userForm.value;
    this.createdUser.forEach(user => {
      if (user.email === this.newUser.email) {
        this.emailIsExisting = true;
        setTimeout(() => {
          this.emailIsExisting = false;
        }, 2000);
      } else {
        if (this.userForm.valid && this.isChecked) {
          this.user.setUser(this.newUser);
          this.router.navigate(['/landing-page/signup/choose-avatar'])
        } else if (!this.isChecked) {
          this.showCheckboxFeedback = true;
          setTimeout(() => {
            this.showCheckboxFeedback = false;
          }, 2000);
        }
      }
    });
  }

  public getUser() {
    return onSnapshot(this.firebase.getUsers(), (users) => {
      this.createdUser = [];
      users.forEach((user) => {
        this.createdUser.push(user.data());
      });
    });
  }
}