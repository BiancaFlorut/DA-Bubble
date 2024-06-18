import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { User } from '../../interfaces/user';
import { AuthService } from '../../services/auth/auth.service';
import { updateProfile } from '@angular/fire/auth';

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
  public currentUser!: User;
  public chooseAvatar: boolean = false;
  public avatar: string = './assets/img/profile.png';
  public showCreateUser: boolean = false;

  @ViewChild('fileInput') public fileInput: any;

  private user = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.currentUser = this.user.getUser();
  }

  public selectedAvatar(avatar: number) {
    this.avatar = `./assets/img/character${avatar}.png`;
    this.chooseAvatar = true;
  }

  public saveUser() {
    if (this.chooseAvatar) {
      this.currentUser.avatar = this.avatar;
      if (this.currentUser.password) {
        this.authService.register(this.currentUser.email, this.currentUser.password)
          .subscribe({
            next: () => {
              const user = this.authService.firebaseAuth.currentUser;
              if (user) {
                updateProfile(user, {
                  displayName: this.currentUser.name,
                  photoURL: this.currentUser.avatar,
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
      this.user.user.name = '';
      this.user.user.email = '';
      this.user.user.password = '';
      this.user.user.avatar = '';
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
      this.authService.uploadProfileImageTemp(file).subscribe({
        next: (downloadURL: string) => {
          this.avatar = downloadURL;
          this.chooseAvatar = true;
        },
        error: (error) => {
          console.error('Error uploading image: ', error);
        }
      });
    }
  }
}