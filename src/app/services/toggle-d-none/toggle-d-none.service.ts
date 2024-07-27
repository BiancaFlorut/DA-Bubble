import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleDNoneService {
  public isClassRemoved: boolean = false;
  public isThreadActive: boolean = false;
  public showWorkSpace: boolean = true;

  public toggleIsClassRemoved(): void {
    this.isClassRemoved = !this.isClassRemoved;
  }

  public toggleIsThreadActive(): void {
    this.isThreadActive = !this.isThreadActive;
  }

  public toggleShowWorkSpace(): void {
    this.showWorkSpace = !this.showWorkSpace;
  }

  public checkWindowInnerWidth(): boolean {
    return window.innerWidth <= 1400;
  }

  public openWorkspace(): void {
    this.isClassRemoved = false;
    this.isThreadActive = false;
  }
}
