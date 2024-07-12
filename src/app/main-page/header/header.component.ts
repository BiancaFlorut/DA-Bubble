import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { UserService } from '../../services/user/user.service';
import { ChatService } from '../../services/chat/chat.service';
import { ThreadChatService } from '../../services/chat/thread-chat/thread-chat.service';
import { EditUserProfileComponent } from '../edit-user-profile/edit-user-profile.component';
import { EditUserProfileService } from '../../services/edit-user-profile/edit-user-profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    EditUserProfileComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  public userService: UserService = inject(UserService);
  private firebase: FirebaseService = inject(FirebaseService);
  private chatService: ChatService = inject(ChatService);
  private threadChatService: ThreadChatService = inject(ThreadChatService);
  public editUserProfileService: EditUserProfileService = inject(EditUserProfileService);

  public isUserMenuActive: boolean = false;

  ngOnInit(): void {
    this.userIsLogged();
    this.redirectLogin();
  }

  private userIsLogged(): void {
    this.authService.user$
      .subscribe(user => {
        if (this.router.url.includes('guest')) {
          this.editUserProfileService.googleUser = false;
          this.userService.user.uid = 'guest';
          this.userService.user.name = 'New Guest';
          this.userService.user.email = 'mail@guest.com';
          this.userService.user.avatar = './assets/img/profile.png';
          this.userService.currentAvatar = './assets/img/profile.png';
          this.userService.user.online = true;
          this.firebase.updateUser(this.userService.user);
          this.firebase.connectUser(this.userService.user);
        } else if (user) {
          this.editUserProfileService.googleUser = user.providerData[0].providerId === 'google.com' ? true : false;
          this.userService.user.uid = user.uid!;
          this.userService.user.name = user.displayName!;
          this.userService.user.email = user.email!;
          this.userService.user.avatar = user.photoURL!;
          this.userService.currentAvatar = user.photoURL!;
          if (user.photoURL?.includes('https://lh3.googleusercontent.com')) {
            this.userService.user.avatar = './assets/img/profile.png';
            this.userService.currentAvatar = './assets/img/profile.png';
          }
          this.userService.user.online = true;
          this.firebase.connectUser(this.userService.user);
        } else {
          this.router.navigate(['landing-page/login']);
        }
      });
  }

  private redirectLogin(): void {
    if (this.authService.currentUserSig() === null || this.router.url.includes('undefined')) {
      this.router.navigate(['/landing-page/login']);
    }
  }

  public toggleMenu(): void {
    if (this.editUserProfileService.showProfile) {
      this.editUserProfileService.toggleShowProfile();
    } else {
      this.isUserMenuActive = !this.isUserMenuActive;
    }
    if (this.userService.user.avatar !== this.userService.currentAvatar) {
      this.userService.user.avatar = this.userService.currentAvatar;
    }
  }

  public toggleProfile(event: Event): void {
    event.stopPropagation();
    this.editUserProfileService.toggleProfile();
  }

  public async logOutUser() {
    this.firebase.currentUser.online = false;
    this.firebase.updateUser(this.firebase.currentUser);
    if (this.router.url.includes('guest')) {
      this.router.navigate(['/landing-page/login']);
    } else {
      await this.authService.logOut()
        .then(() => {
          this.router.navigate(['/landing-page/login']);
        })
    }
    this.chatService.resetChat();
    this.threadChatService.exitThread();
  }
}