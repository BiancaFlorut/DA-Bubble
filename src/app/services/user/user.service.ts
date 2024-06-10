import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private user: User = {
    name: '',
    email: '',
    password: '',
    avatar: ''
  };

  constructor() { }

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
