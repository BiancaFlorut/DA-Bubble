import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { browserSessionPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase/firebase.service';

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
  private firebaseService = inject(FirebaseService);

  ngOnInit() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      password: ['', [Validators.required, Validators.pattern(/^.{8,}$/)]]
    });
    this.userService.resetUser();
    setPersistence(this.authService.firebaseAuth, browserSessionPersistence);
    onAuthStateChanged(this.authService.firebaseAuth, (user) => {
      if (user) {
        let currentUser = this.firebaseService.getUser(user.uid);
        if (currentUser) {
          currentUser.online = true;
          this.firebaseService.updateUser(currentUser);
        }
      } else {
        this.firebaseService.currentUser.online = false;
        this.firebaseService.updateUser(this.firebaseService.currentUser);
      }
    })
  }

  public async loginWithGoogle() {
    await this.authService.googleSignIn()
      .then(data => {
        if (data) {
          this.router.navigate([`main-page/${data.user.uid}`]);
        }
      });
  }

  public async login() {
    await this.authService.login(this.userForm.get('email')?.value, this.userForm.get('password')?.value)
      .then((result) => {
        const user = result.user.uid;
        this.router.navigate([`main-page/${user}`]);
      })
      .catch((error) => {
        if (error.code === 'auth/user-not-found') {
          this.errorMessage = 'user-not-found';
        } else if (error.code === 'auth/wrong-password') {
          this.errorMessage = 'wrong-password';
        } else if (error.code === 'auth/too-many-requests') {
          this.errorMessage = 'too-many-requests';
        }
      });
  }

  public loginAsGuest() {
    this.router.navigate(['main-page/guest']);
  }
}