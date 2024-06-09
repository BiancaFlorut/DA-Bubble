import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { User } from '../../interfaces/user';
import { FirebaseService } from '../../services/firebase/firebase.service';

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
  currentUser!: User;
  chooseAvatar: boolean = false;
  avatar: string = './assets/img/auth/profile.png';

  constructor(private user: UserService, private firebase: FirebaseService) {
    this.currentUser = this.user.getUser();
  }

  public selectedAvatar(avatar: number): void {
    this.avatar = `./assets/img/auth/character${avatar}.png`;
    this.chooseAvatar = true;
  }

  public saveUser(): void {
    this.currentUser.avatar = this.avatar;
    this.firebase.addUser(this.currentUser);
  }
}