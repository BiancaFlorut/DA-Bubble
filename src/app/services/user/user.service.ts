import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public user: User = {
    name: '',
    email: '',
    password: '',
    avatar: ''
  };

  public setUser(user: User) {
    this.user = user;
  }

  public getUser() {
    return this.user;
  }

  public updateUser(data: Partial<User>) {
    this.user = { ...this.user, ...data };
  }
}
