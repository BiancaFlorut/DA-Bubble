import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShowProfileService {
  public showProfile: boolean = false;

  public toggleShowProfile(): void {
    this.showProfile = !this.showProfile;
  }
}
