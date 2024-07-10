import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChannelModalService {
  public showModal: boolean = false;

  public toggleShowModal() {
    this.showModal = !this.showModal;
  }
}
