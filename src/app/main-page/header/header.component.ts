import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './edit-user.component.scss']
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
    this.loggedOut();
  }

  public loggedOut() {
    if (this.authService.currentUserSig() === null) {
      this.router.navigate(['/landing-page']);
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
      this.authService.updateUserName(this.currentUser.name);
      this.authService.updateUserEmail(this.currentUser.email);
      this.toggleEditMenu();
    }
  }

  private emailExisting() {
    this.emailIsExisting = true;
    setTimeout(() => {
      this.emailIsExisting = false;
    }, 2000);
  }
}