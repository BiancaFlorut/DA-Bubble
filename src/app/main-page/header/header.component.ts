import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { UserService } from '../../services/user/user.service';
import { UploadResult } from 'firebase/storage';
import { getDownloadURL } from '@angular/fire/storage';

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
        if (user && user.email && user.photoURL) {
          this.userService.user.uid = user.uid!;
          this.userService.user.name = user.displayName!;
          this.userService.user.email = user.email!;
          this.userService.user.avatar = user.photoURL!;
          this.userService.currentAvatar = user.photoURL!;
          this.userService.user.online = true;
          console.log(this.userService.user)
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

  public onUploadButtonClick() {
    if (this.editUser) {
      this.fileInput.nativeElement.click();
    }
  }

  private userAvatarIsNotSave() {
    if (this.userService.user.avatar !== this.userService.currentAvatar) {
      this.userService.user.avatar = this.userService.currentAvatar;
    }
  }

  public onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.file = fileInput.files[0];
      this.authService.uploadProfileImageTemp(this.file)
        .subscribe({
          next: (uploadResult: UploadResult) => {
            this.handleDownloadURL(uploadResult);
          },
          error: (error) => {
            console.error('Error uploading image: ', error);
          }
        });
    }
  }

  private handleDownloadURL(uploadResult: UploadResult) {
    getDownloadURL(uploadResult.ref)
      .then((downloadURL: string) => {
        this.userService.user.avatar = downloadURL;
      }).catch((error) => {
        console.error('Error getting download URL: ', error);
      });
  }

  public editUserData(): void {
    this.userService.user.name = this.userForm.get('name')?.value;
    const emailExists = this.userService.user.email === this.userForm.get('email')?.value;
    this.authService.user$
      .subscribe(user => {
        if (user) {
          this.authService.updateUserName(user, this.userService.user.name);
          if (!emailExists) {
            this.userService.user.email = this.userForm.get('email')?.value;
            this.authService.updateUserEmail(user, this.userService.user.email);
          }
          this.firebase.updateUser(this.userService.user);
          if (this.userService.user.avatar) {
            this.userService.currentAvatar = this.userService.user.avatar;
            this.authService.updateUserPhotoURL(user, this.userService.user.avatar);
          }
          this.toggleEditMenu();
        }
      });
  }

  public handleStatus(): void {
    this.userService.user.online = !this.userService.user.online;
  }

  public logOutUser(): void {
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
}