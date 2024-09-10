import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  midToScroll = signal<string>('');

  constructor() { }


  /**
   * Scrolls to the given element. If the element is not given, nothing
   * happens.
   *
   * @param elem The element to scroll to.
   */
  public scrollToBottom(elem: any) {
    if (elem)
      elem.scrollIntoView();
  }

}
