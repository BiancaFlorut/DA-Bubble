import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { UserService } from '../../services/user/user.service';
import { ChatService } from '../../services/chat/chat.service';
import { ThreadChatService } from '../../services/chat/thread-chat/thread-chat.service';
import { EditUserProfileComponent } from '../edit-user-profile/edit-user-profile.component';
import { EditUserProfileService } from '../../services/edit-user-profile/edit-user-profile.service';
import { FirebaseChannelService } from '../../services/firebase-channel/firebase-channel.service';
import { ToggleDNoneService } from '../../services/toggle-d-none/toggle-d-none.service';
import { SearchService } from '../../services/search/search.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    EditUserProfileComponent,
    FormsModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss', './header.component.media.scss']
})
export class HeaderComponent {
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  public userService: UserService = inject(UserService);
  public firebase: FirebaseService = inject(FirebaseService);
  private chatService: ChatService = inject(ChatService);
  private threadChatService: ThreadChatService = inject(ThreadChatService);
  private channelService: FirebaseChannelService = inject(FirebaseChannelService);
  public editUserProfileService: EditUserProfileService = inject(EditUserProfileService);
  public toggleDNone: ToggleDNoneService = inject(ToggleDNoneService);
  public searchService: SearchService = inject(SearchService);

  public isUserMenuActive: boolean = false;
  public search: string = '';

  ngOnInit(): void {
    this.userIsLogged();
    this.redirectLogin();
  }

  private userIsLogged(): void {
    this.authService.user$
      .subscribe(user => {
        if (this.router.url.includes('guest')) {
          this.setGuestUser();
        } else if (user) {
          this.setUser(user);
          this.firebase.connectUser(this.firebase.currentUser);
        } else {
          this.router.navigate(['landing-page/login']);
        }
      });
  }

  private setGuestUser(): void {
    this.editUserProfileService.googleUser = false;
    this.firebase.currentUser.uid = 'guest';
    this.firebase.currentUser.name = 'New Guest';
    this.firebase.currentUser.email = 'mail@guest.com';
    this.firebase.currentUser.avatar = './assets/img/profile.png';
    this.userService.currentAvatar = './assets/img/profile.png';
    this.firebase.connectUser(this.firebase.currentUser);
  }

  private setUser(user: any): void {
    this.editUserProfileService.googleUser = user.providerData[0].providerId === 'google.com' ? true : false;
    this.firebase.currentUser.uid = user.uid!;
    this.firebase.currentUser.name = user.displayName!;
    this.firebase.currentUser.email = user.email!;
    this.firebase.currentUser.avatar = user.photoURL!;
    this.userService.currentAvatar = user.photoURL!;
    if (user.photoURL?.includes('https://lh3.googleusercontent.com')) {
      this.firebase.currentUser.avatar = './assets/img/profile.png';
      this.userService.currentAvatar = './assets/img/profile.png';
    }
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
    if (this.firebase.currentUser.avatar !== this.userService.currentAvatar) {
      this.firebase.currentUser.avatar = this.userService.currentAvatar;
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
    this.channelService.resetChannel();
    this.chatService.newMessage.set(true);
  }
}