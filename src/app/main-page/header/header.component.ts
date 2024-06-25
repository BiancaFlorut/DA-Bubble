import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { UserService } from '../../services/user/user.service';

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
  private fb: FormBuilder = inject(FormBuilder);
  private authService: AuthService = inject(AuthService);
  public userService: UserService = inject(UserService);
  private firebase: FirebaseService = inject(FirebaseService);

  public isUserMenuActive: boolean = false;
  public showProfile: boolean = false;
  public editUser: boolean = false;
  public userForm!: FormGroup;
  public showProfileButton: boolean = false;
  private file!: File;

  @ViewChild('fileInput') public fileInput: any;

  ngOnInit(): void {
    this.userIsLogged();
    this.initializeForm();
    this.isLoggedAsGuestOrGoogleUser();
    this.redirectLogin();
  }

  private userIsLogged(): void {
    this.authService.user$
      .subscribe(user => {
        if (user) {
          this.userService.user.uid = user.uid!;
          this.userService.user.name = user.displayName!;
          this.userService.user.email = user.email!;
          this.userService.user.avatar = user.photoURL!;
          this.userService.currentAvatar = user.photoURL!;
          this.userService.user.online = true;
          this.firebase.connectUser(this.userService.user);
        } else {
          this.router.navigate(['landing-page/login']);
        }
      });
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });
  }

  private isLoggedAsGuestOrGoogleUser(): void {
    if (localStorage.getItem('loggedAsGuestOrGoogleUser') !== null) {
      localStorage.removeItem('loggedAsGuestOrGoogleUser');
      this.showProfileButton = true;
    } else {
      this.showProfileButton = false;
    }
  }

  private redirectLogin(): void {
    if (this.authService.currentUserSig() === null || this.router.url.includes('undefined')) {
      this.router.navigate(['/landing-page/login']);
    }
  }

  public toggleMenu(): void {
    if (this.showProfile) {
      this.showProfile = !this.showProfile;
    } else {
      this.isUserMenuActive = !this.isUserMenuActive;
    }
    this.userAvatarIsNotSave();
  }

  public toggleProfile(event: Event): void {
    event.stopPropagation()
    this.showProfile = !this.showProfile;
    this.editUser = false;
    this.setNameAndEmailValue();
    this.userAvatarIsNotSave();
  }

  public toggleEditMenu(): void {
    this.editUser = !this.editUser;
    this.setNameAndEmailValue();
    this.userAvatarIsNotSave();
  }

  private setNameAndEmailValue(): void {
    this.userForm.get('name')?.setValue(this.userService.user.name);
    this.userForm.get('email')?.setValue(this.userService.user.email);
  }

  private userAvatarIsNotSave() {
    if (this.userService.user.avatar !== this.userService.currentAvatar) {
      this.userService.user.avatar = this.userService.currentAvatar;
    }
  }

  public onUploadButtonClick() {
    if (this.editUser) {
      this.fileInput.nativeElement.click();
    }
  }

  public async onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.file = fileInput.files[0];
      let uploadedPhoto = await this.authService.uploadProfileImageTemp(this.file);
      if (uploadedPhoto) {
        this.userService.user.avatar = uploadedPhoto;
      }
    }
  }

  public async editUserData() {
    this.userService.user.name = this.userForm.get('name')?.value;
    const emailExists = this.userService.user.email === this.userForm.get('email')?.value;
    await this.authService.updateUserName(this.userService.user.name);
    if (!emailExists) {
      this.userService.user.email = this.userForm.get('email')?.value;
      await this.authService.updateUserEmail(this.userService.user.email);
    }
    if (this.userService.user.avatar) {
      this.userService.currentAvatar = this.userService.user.avatar;
      await this.authService.updateUserPhotoURL(this.userService.user.avatar);
    }
    this.firebase.updateUser(this.userService.user);
    this.toggleEditMenu();
  }

  public handleStatus(): void {
    this.userService.user.online = !this.userService.user.online;
    this.firebase.updateUser(this.userService.user);
  }

  public async logOutUser() {
    if (this.router.url.includes('guest')) {
      this.router.navigate(['/landing-page/login']);
    } else {
      await this.authService.logOut()
        .then(() => {
          this.router.navigate(['/landing-page/login']);
        })
    }
  }
}