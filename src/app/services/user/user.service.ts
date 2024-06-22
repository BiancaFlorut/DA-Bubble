import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';

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
  }
}
