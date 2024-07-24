import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelModalService {
  public showAddPeople: boolean = false;
  public showMembers: boolean = false;
  public showUpdateChannel: boolean = false;
  public addMobileClassToAddPeople: boolean = false;

  public toggleShowAddPeople(): void {
    this.showAddPeople = !this.showAddPeople;
  }

  public toggleShowMembers(): void {
    this.showMembers = !this.showMembers;
  }

  public toggleShowUpdateChannel(): void {
    this.showUpdateChannel = !this.showUpdateChannel;
  }

  public toggleaddMobileClassToAddPeople(): void {
    this.addMobileClassToAddPeople = !this.addMobileClassToAddPeople;
  }

  public closeAllModals(): void {
    this.showAddPeople = false;
    this.showMembers = false;
    this.showUpdateChannel = false;
  }
}
