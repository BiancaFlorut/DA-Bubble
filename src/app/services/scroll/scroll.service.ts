import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  midToScroll = signal<string>('');

  constructor() { }


  public scrollToBottom(elem: any) {
    if (elem)
      elem.scrollIntoView();
  }

}
