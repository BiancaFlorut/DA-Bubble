import { Component, inject, ViewChild } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { Router } from '@angular/router';
import { EditUserProfileService } from '../../services/edit-user-profile/edit-user-profile.service';

@Component({
  selector: 'app-edit-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-user-profile.component.html',
  styleUrl: './edit-user-profile.component.scss'
})
export class EditUserProfileComponent {
  public userService: UserService = inject(UserService);
  private authService: AuthService = inject(AuthService);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public editUserProfileService: EditUserProfileService = inject(EditUserProfileService);
  private router: Router = inject(Router);
  private fb: FormBuilder = inject(FormBuilder);

  public userForm!: FormGroup;
  private file!: File;

  @ViewChild('fileInput') public fileInput: any;

  ngOnInit(): void {
    this.initializeForm();
    this.disableNameAndEmailForGoogleUser();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      name: [{ value: '', disabled: this.editUserProfileService.googleUser }, [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: [{ value: '', disabled: this.editUserProfileService.googleUser }, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });
  }

  private disableNameAndEmailForGoogleUser() {
    if (this.editUserProfileService.googleUser) {
      const nameControl = this.userForm.get('name');
      const emailControl = this.userForm.get('email');
      if (nameControl) {
        nameControl.disable();
      }
      if (emailControl) {
        emailControl.disable();
      }
    }
  }

  public toggleProfile(event: Event): void {
    event.stopPropagation();
    this.editUserProfileService.toggleProfile();
    this.setNameAndEmailValue();
    this.userAvatarIsNotSave();
  }

  public toggleEditMenu(): void {
    this.editUserProfileService.toggleEditMenu();
    this.setNameAndEmailValue();
    this.userAvatarIsNotSave();
  }

  private setNameAndEmailValue(): void {
    this.userForm.get('name')?.setValue(this.firebaseService.currentUser.name);
    this.userForm.get('email')?.setValue(this.firebaseService.currentUser.email);
  }

  private userAvatarIsNotSave() {
    if (this.firebaseService.currentUser.avatar !== this.userService.currentAvatar) {
      this.firebaseService.currentUser.avatar = this.userService.currentAvatar;
    }
  }

  public onUploadButtonClick() {
    if (this.editUserProfileService.editUser) {
      this.fileInput.nativeElement.click();
    }
  }

  public async onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      this.file = fileInput.files[0];
      let uploadedPhoto = await this.authService.uploadProfileImageTemp(this.file);
      if (uploadedPhoto) {
        this.firebaseService.currentUser.avatar = uploadedPhoto;
      }
    }
  }

  public async editUserData() {
    this.firebaseService.currentUser.name = this.userForm.get('name')?.value;
    const emailExists = this.firebaseService.currentUser.email === this.userForm.get('email')?.value;
    if (!this.router.url.includes('guest')) {
      await this.authService.updateUserName(this.firebaseService.currentUser.name);
    }
    if (this.firebaseService.currentUser.avatar) {
      this.userService.currentAvatar = this.firebaseService.currentUser.avatar;
      if (!this.router.url.includes('guest')) {
        await this.authService.updateUserPhotoURL(this.firebaseService.currentUser.avatar)
      }
    }
    if (!emailExists) {
      this.firebaseService.currentUser.email = this.userForm.get('email')?.value;
      if (!this.router.url.includes('guest')) {
        await this.authService.updateUserEmail(this.firebaseService.currentUser.email);
      }
    }
    this.firebaseService.updateUser(this.firebaseService.currentUser);
    this.toggleEditMenu();
  }

  public handleStatus(): void {
    this.firebaseService.currentUser.online = !this.firebaseService.currentUser.online;
    this.firebaseService.updateUser(this.firebaseService.currentUser);
  }
}
