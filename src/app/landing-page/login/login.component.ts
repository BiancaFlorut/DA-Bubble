import { Component, inject } from '@angular/core';
import { onSnapshot } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { Auth, GoogleAuthProvider, signInWithRedirect } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
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
  private afAuth = inject(Auth);

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
        this.createdUser.push(user.data());
      });
    });
  }

  public login() {
    this.emailExisting();
    this.passwordExisting();
    this.navigateToMainPage();
  }

  public async loginWithGoggle() {
    await signInWithRedirect(this.afAuth, new GoogleAuthProvider());
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
      this.router.navigate(['']);
    }
  }
}