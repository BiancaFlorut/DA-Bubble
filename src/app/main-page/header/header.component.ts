import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../interfaces/user';
import { User as FirebaseAuthUser } from '@firebase/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header.component.edit-user.scss']
})
export class HeaderComponent {
  private router: Router = inject(Router);
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);

  public isUserMenuActive: boolean = false;
  public loggedAsGuest: boolean = false;
  public showProfile: boolean = false;
  public editUser: boolean = false;
  public emailIsExisting: boolean = false;
  public userForm!: FormGroup;
  public errorMessage!: string;

  public currentUser: User = {
    name: '',
    email: '',
    password: '',
    avatar: '',
  };

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });
    this.loggedGuest();
    this.loggedUser();
    this.redirectLogin();
  }

  public redirectLogin() {
    if (this.authService.currentUserSig() === null || this.router.url.includes('undefined')) {
      this.router.navigate(['/landing-page/login']);
    }
  }

  private loggedGuest() {
    if (this.router.url.includes('guest')) {
      this.currentUser.name = 'Guest';
      this.currentUser.email = 'guest@gmail.com';
      this.currentUser.avatar = './assets/img/profile.png';
      this.currentUser.password = '';
      this.loggedAsGuest = true;
    }
  }

  private loggedUser() {
    this.authService.user$.forEach(user => {
      if (this.router.url.includes(`main-page/${user?.uid}`)) {
        if (user) {
          this.currentUser.name = user.displayName!;
          this.currentUser.email = user.email!;
          this.currentUser.avatar = user.photoURL!;
        }
      }
    });
  }

  public toggleMenu() {
    if (this.showProfile) {
      this.showProfile = !this.showProfile;
    } else {
      this.isUserMenuActive = !this.isUserMenuActive;
    }
  }

  public logOutUser() {
    if (this.router.url.includes('guest')) {
      this.router.navigate(['/landing-page/login']);
    } else {
      this.authService.logOut()
        .subscribe({
          next: () => {
            this.router.navigate(['/landing-page/login']);
          },
          error: (error) => {
            console.error('Logout failed', error);
          }
        });
    }
  }

  public toggleProfile(event: Event) {
    event.stopPropagation()
    this.showProfile = !this.showProfile;
    this.editUser = false;
    this.userForm.reset();
  }

  public toggleEditMenu() {
    this.editUser = !this.editUser;
    this.userForm.reset();
  }

  public async editUserData() {
    const inputEmail = this.userForm.get('email')?.value;
    const emailExists = this.currentUser.email === inputEmail;
    if (emailExists) {
      this.emailExisting();
    } else {
      this.currentUser.name = this.userForm.get('name')?.value;
      this.currentUser.email = this.userForm.get('email')?.value;
      this.authService.user$
        .subscribe(user => {
          if (user) {
            this.subcribeUpdateUserName(user);
            this.subcribeUpdateUserEmail(user);
          }
        });
    }
  }

  private subcribeUpdateUserName(user: FirebaseAuthUser) {
    this.authService.updateUserName(user, this.currentUser.name)
      .subscribe({
        error: err => {
          if (err.code === 'auth/user-token-expired') {
            this.errorMessage = 'auth/user-token-expired';
          } else {
            this.toggleEditMenu();
          }
        }
      });
  }

  private subcribeUpdateUserEmail(user: FirebaseAuthUser) {
    this.authService.updateUserEmail(user, this.currentUser.email)
      .subscribe({
        error: err => {
          if (err.code === 'auth/user-token-expired') {
            this.errorMessage = 'auth/user-token-expired';
          } else {
            this.toggleEditMenu();
          }
        }
      });
  }

  private emailExisting() {
    this.emailIsExisting = true;
    setTimeout(() => {
      this.emailIsExisting = false;
    }, 2000);
  }
}