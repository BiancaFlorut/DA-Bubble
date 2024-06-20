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
    password: '',
    avatar: '',
    online: false
  };

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
      password: '',
      avatar: '',
      online: false
    };
  }
}
