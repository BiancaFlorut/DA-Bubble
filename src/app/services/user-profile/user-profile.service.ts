import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  public userDetails: User | undefined;

  public showUserDetails(user: User): void {
    if (user) {
      this.userDetails = user;
    }
  }
}
