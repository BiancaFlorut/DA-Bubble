import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EditUserProfileService {
  public showProfile: boolean = false;
  public editUser: boolean = false;
  public googleUser: boolean = false;

  public toggleShowProfile(): void {
    this.showProfile = !this.showProfile;
    if (this.showProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }

  public toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.editUser = false;
    if (this.showProfile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }

  public toggleEditMenu(): void {
    this.editUser = !this.editUser;
  }
}
