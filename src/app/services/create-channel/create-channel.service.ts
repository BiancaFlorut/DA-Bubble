import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreateChannelService {
  public showCreateChannel: boolean = false;
  public showChannel: boolean = false;

  public toggleShowCreateChannel(): void {
    this.showCreateChannel = !this.showCreateChannel;
  }

  public toggleShowChannel(): void {
    this.showChannel = !this.showChannel;
  }
}
