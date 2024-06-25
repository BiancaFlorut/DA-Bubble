import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';

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

  public async saveUser() {
    if (this.chooseAvatar) {
      this.userService.user.avatar = this.avatar;
      if (this.userService.userPassword) {
        await this.authService.register(
          this.userService.user.name,
          this.userService.user.email,
          this.userService.userPassword,
          this.userService.user.avatar
        )
          .then(() => {
            this.showCreateUserAndNavigateToLogin();
          })
          .catch(error => {
            localStorage.setItem('error', `${error}`);
            this.router.navigate(['./landing-page/signup']);
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

  public async onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      let uploadedPhoto = await this.authService.uploadProfileImageTemp(file);
      if (uploadedPhoto) {
        this.avatar = uploadedPhoto;
        this.chooseAvatar = true;
      }
    }
  }
}