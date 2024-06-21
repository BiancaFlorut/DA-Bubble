import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { updateProfile } from '@angular/fire/auth';
import { UploadResult } from 'firebase/storage';
import { getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './choose-avatar.component.html',
  styleUrl: './choose-avatar.component.scss'
})
export class ChooseAvatarComponent {
  public chooseAvatar: boolean = false;
  public avatar: string = './assets/img/profile.png';
  public showCreateUser: boolean = false;

  @ViewChild('fileInput') public fileInput: any;

  public userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);

  public selectedAvatar(avatar: number) {
    this.avatar = `./assets/img/character${avatar}.png`;
    this.chooseAvatar = true;
  }

  public saveUser() {
    if (this.chooseAvatar) {
      this.userService.user.avatar = this.avatar;
      if (this.userService.userPassword) {
        this.authService.register(this.userService.user.email, this.userService.userPassword)
          .subscribe({
            next: () => {
              const user = this.authService.firebaseAuth.currentUser;
              if (user) {
                updateProfile(user, {
                  displayName: this.userService.user.name,
                  photoURL: this.userService.user.avatar,
                });
              }
              this.showCreateUserAndNavigateToLogin();
            },
            error: error => {
              localStorage.setItem('error', `${error}`);
              this.router.navigate(['./landing-page/signup']);
            }
          });
      }
    }
  }

  private showCreateUserAndNavigateToLogin() {
    this.showCreateUser = true;
    setTimeout(() => {
      this.showCreateUser = false;
      this.router.navigate(['./landing-page/login']);
    }, 2000);
  }

  public onUploadButtonClick() {
    this.fileInput.nativeElement.click();
  }

  public onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      this.authService.uploadProfileImageTemp(file)
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

  handleDownloadURL(uploadResult: UploadResult) {
    getDownloadURL(uploadResult.ref)
      .then((downloadURL: string) => {
        this.avatar = downloadURL;
        this.chooseAvatar = true;
      }).catch((error) => {
        console.error('Error getting download URL: ', error);
      });
  }
}