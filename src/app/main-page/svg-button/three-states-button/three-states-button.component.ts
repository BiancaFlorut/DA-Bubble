import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-three-states-button',
  standalone: true,
  imports: [],
  templateUrl: './three-states-button.component.html',
  styleUrl: './three-states-button.component.scss'
})
export class ThreeStatesButtonComponent {
  @Input({ required: true }) source: string = "";
  @Input() active = false;
  @ViewChild('img') img!: ElementRef;

  enterSource() {
    this.img.nativeElement.src = this.img.nativeElement.src.split("_")[0] + "_hover.svg";
  }
  leaveSource() {
    this.img.nativeElement.src = this.getSource();
  }

  getSource() {
    if (this.active) {
      return this.source.split("_")[0] + "_active.svg";
    } else {
      return this.source;
    }
  }

  setActive() {
    this.img.nativeElement.src = this.source.split("_")[0] + "_active.svg";
    this.img.nativeElement.style.scale = "1.05";
  }

  setBack() {
    this.img.nativeElement.src = this.img.nativeElement.src.split("_")[0] + "_hover.svg";
    this.img.nativeElement.style.scale = "1";
  }
}
