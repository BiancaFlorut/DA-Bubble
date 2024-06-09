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

  setUser(user: User): void {
    this.user = user;
  }

  getUser(): User {
    return this.user;
  }

  updateUser(data: Partial<User>): void {
    this.user = { ...this.user, ...data };
  }
}
