import { Component, inject } from '@angular/core';
import { onSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { AngularFireAuth, AngularFireAuthModule } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    AngularFireAuthModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public validEmail!: boolean;
  public validPassword!: boolean;
  public userForm!: FormGroup;
  public createdUser!: any[];

  private fb = inject(FormBuilder);
  private firebase = inject(FirebaseService);
  private router = inject(Router);
  // private angularAuth = inject(AngularFireAuth);

  ngOnInit() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.getUser();
  }

  public getUser() {
    return onSnapshot(this.firebase.getUsers(), (users) => {
      this.createdUser = [];
      users.forEach((user) => {
        this.createdUser.push({ id: user.id, ...user.data() });
      });
    });
  }

  public login() {
    this.emailExisting();
    this.passwordExisting();
    this.navigateToMainPage();
  }

  public guestLogin() {
    this.router.navigate([`main-page/guest`]);
  }

  public async loginWithGoogle() {
    // this.angularAuth.signInWithPopup(new GoogleAuthProvider).then(() => {
    //   console.log('gut');
    // })
    // .catch(error => {
    //   console.log(error)
    // });
    // this.router.navigate(['main-page']);
  }

  private emailExisting() {
    const inputEmail = this.userForm.get('email')?.value;
    const emailExists = this.createdUser.some(user => user.email === inputEmail);
    if (!emailExists) {
      this.validEmail = true;
      setTimeout(() => {
        this.validEmail = false;
      }, 2000);
    }
  }

  private passwordExisting() {
    const inputPassword = this.userForm.get('password')?.value;
    const passwordExists = this.createdUser.some(user => user.password === inputPassword);
    if (!passwordExists) {
      this.validPassword = true;
      setTimeout(() => {
        this.validPassword = false;
      }, 2000);
    }
  }

  private navigateToMainPage() {
    if (this.userForm.valid && !this.validEmail && !this.validPassword) {
      this.createdUser.forEach(user => {
        if (user.email === this.userForm.get('email')?.value) {
          this.router.navigate([`main-page/${user.id}`]);
        }
      });
    }
  }
}