import { Injectable, inject } from '@angular/core';
import { User } from '../../interfaces/user';
import { Emoji } from '../../models/emoji.class';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user: User = {
    uid: '',
    name: '',
    email: '',
    avatar: '',
    online: false
  };
  firebase = inject(FirebaseService);
  emojis:Emoji[] = [
      new Emoji('nerd face', './assets/img/main-page/reactions/emoji _nerd face_.svg', this.firebase.currentUser.uid!),
      new Emoji('person raising both hands in celebration', './assets/img/main-page/reactions/emoji _person raising both hands in celebration_.svg', this.firebase.currentUser.uid!),
      new Emoji('rocket', './assets/img/main-page/reactions/emoji _rocket_.svg', this.firebase.currentUser.uid!),
      new Emoji('white heavy check mark', './assets/img/main-page/reactions/emoji _white heavy check mark_.svg', this.firebase.currentUser.uid!)
  ];
  

  public userPassword: string = '';
  public currentAvatar: string = '';

  public setUser(user: User) {
    this.user = user;
  }

  public getUser() {
    return this.user;
  }

  public resetUser() {
    this.user = {
      uid: '',
      name: '',
      email: '',
      avatar: '',
      online: false
    };
    this.userPassword = '';
  }

  sortEmojis() {
    this.emojis.sort((a, b) => b.count - a.count);
  }
}
