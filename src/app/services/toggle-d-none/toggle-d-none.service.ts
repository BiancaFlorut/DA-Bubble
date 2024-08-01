import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleDNoneService {
  public isClassRemoved: boolean = false;
  public isThreadActive: boolean = false;
  public showWorkSpace: boolean = true;
  public isScreenWide: boolean = true;

  public toggleIsClassRemoved(): void {
    this.isClassRemoved = !this.isClassRemoved;
  }

  public toggleIsThreadActive(): void {
    this.toggleIsScreenWide();
    if (!this.showWorkSpace && !this.isThreadActive && this.isScreenWide) {
      this.isScreenWide = false;
    } else {
      this.isThreadActive = !this.isThreadActive;
    }
  }

  public toggleShowWorkSpace(): void {
    this.toggleIsScreenWide();
    if (!this.showWorkSpace && !this.isThreadActive && !this.isScreenWide) {
      this.isScreenWide = true;
    } else {
      this.showWorkSpace = !this.showWorkSpace;
    }
  }

  public toggleIsScreenWide() {
    this.isScreenWide = !this.isScreenWide;
  }

  public openWorkspace(): void {
    this.isClassRemoved = false;
    this.isThreadActive = false;
  }
}
