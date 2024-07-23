import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleDNoneService {
  public isClassRemoved: boolean = false;
  public isThreadActive: boolean = false;

  public toggleIsClassRemoved(): void {
    this.isClassRemoved = !this.isClassRemoved;
  }

  public toggleIsThreadActive(): void {
    this.isThreadActive = !this.isThreadActive;
  }

  public openWorkspace(): void {
    this.isClassRemoved = false;
    this.isThreadActive = false;
  }
}
