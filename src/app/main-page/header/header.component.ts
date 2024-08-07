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
import { User } from '../../interfaces/user';
import { Message } from '../../models/message.class';
import { Channel } from '../../interfaces/channel';
import { Chat } from '../../models/chat.class';
import { ScrollService } from '../../services/scroll/scroll.service';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';

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
  styleUrl: './header.component.scss'
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
  private searchService: SearchService = inject(SearchService);
  private scrollService = inject(ScrollService);


  public foundChannels: Channel[] = [];
  public foundUsers: User[] = [];
  public foundMessages: { user: User, message: Message, channel?: Channel, chatId: string | undefined }[] = [];

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
          this.editUserProfileService.googleUser = false;
          this.firebase.currentUser.uid = 'guest';
          this.firebase.currentUser.name = 'New Guest';
          this.firebase.currentUser.email = 'mail@guest.com';
          this.firebase.currentUser.avatar = './assets/img/profile.png';
          this.userService.currentAvatar = './assets/img/profile.png';
          // this.firebase.currentUser.online = true;
          // this.firebase.updateUser(this.firebase.currentUser);
          this.firebase.connectUser(this.firebase.currentUser);
        } else if (user) {
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
          // this.firebase.currentUser.online = true;
          this.firebase.connectUser(this.firebase.currentUser);
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
    this.chatService.newMessage = true;
  }

  public searchContent(): void {
    this.foundChannels = [];
    this.foundUsers = [];
    this.foundMessages = [];
    this.channelService.userChannelsContent.forEach(channel => {
      if (channel.channel.name.toLowerCase().includes(this.search.toLowerCase()) && this.search !== '') {
        if (!this.foundChannels.find(el => el.id === channel.channel.id))
        this.foundChannels.push(channel.channel);
      }
      channel.messages.forEach(message => {
        const dom = new DOMParser().parseFromString(message.text, "text/html");
        const text = dom.documentElement.textContent;
        if (text && this.search !== '' && text.toLowerCase().includes(this.search.toLowerCase())) {
          if (!this.foundMessages.find(el => el.message.mid === message.mid)) {
            this.foundMessages.push({ user: this.firebase.getUser(message.uid)!, message: message, channel: channel.channel, chatId: undefined });
          }
        }
      });
    })
    this.firebase.users.forEach(user => {
      if (user.name.toLowerCase().includes(this.search.toLowerCase()) && this.search !== '') {
        this.foundUsers.push(user);
      }
    });
    if (this.search != '') 
    this.searchMessagesInDirectChats();
  }

  searchMessagesInDirectChats() {
    if (!this.firebase.currentUser.directChatIds) {
      console.log('current user has no direct chats');
      return;
    }
    this.firebase.currentUser.directChatIds.forEach( chatId => {
      const ref = this.firebase.getSingleChat(chatId);
      const messagesRef = collection(ref, 'messages');
      const q = query(messagesRef);
      onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const dom = new DOMParser().parseFromString(doc.data()['text'], "text/html");
          const text = dom.documentElement.textContent;
          if (text && this.search !== '' && text.toLowerCase().includes(this.search.toLowerCase()))
          if (!this.foundMessages.find(el => el.message.mid === doc.data()['mid'])) 
          this.foundMessages.push({
            user: this.firebase.getUser(doc.data()['uid'])!, 
            message: doc.data() as Message, 
            channel: undefined, 
            chatId: chatId});
        })
      })
      
    })
  }

  public chooseFoundedChannel(channel: any): void {
    this.search = '';
    this.foundChannels = [];
    this.foundUsers = [];
    this.searchService.getAllUsersFromChannel(channel);
  }

  public chooseFoundedUser(user: any): void {
    this.search = '';
    this.foundChannels = [];
    this.foundUsers = [];
    this.searchService.openDirectChat(user);
  }

  async chooseFoundedMessage(message: { user: User, message: Message, channel?: Channel, chatId: string | undefined }) {
    this.search = '';
    this.foundChannels = [];
    this.foundUsers = [];
    this.foundMessages = [];
    if (message.channel) {
      this.searchService.getAllUsersFromChannel(message.channel) 
    }
    else if (message.chatId){
      const chatRef = this.firebase.getSingleChat(message.chatId);
      const uidsData = await getDoc(chatRef);
      const uids = uidsData.data()!['uids'] as string[];
      uids.splice(uids.indexOf(this.firebase.currentUser.uid!), 1);
      let partner;
      if (uids.length === 0) partner = this.firebase.currentUser;
      else partner = this.firebase.getUser(uids[0]);
      if (partner)
      await this.searchService.openDirectChat(partner);
    }
    this.scrollService.midToScroll.set(message.message.mid);
  }
}