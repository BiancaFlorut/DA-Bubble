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

  /**
   * Changes the image source of the element to append "_hover" to the original
   * filename when the mouse is hovered over the element.
   */
  enterSource() {
    this.img.nativeElement.src = this.img.nativeElement.src.split("_")[0] + "_hover.svg";
  }
  /**
   * Changes the image source of the element back to its original filename when the
   * mouse is no longer hovering over the element.
   */
  leaveSource() {
    this.img.nativeElement.src = this.getSource();
  }

  /**
   * Returns the source of the image depending on the component's active state.
   * If the component is active, it will return the source with "_active" appended,
   * otherwise it will return the original source.
   * @returns The source of the image.
   */
  getSource() {
    if (this.active) {
      return this.source.split("_")[0] + "_active.svg";
    } else {
      return this.source;
    }
  }

  /**
   * Sets the image source to the active state and scales the image up
   * slightly to give the user feedback that the button is active.
   */
  setActive() {
    this.img.nativeElement.src = this.source.split("_")[0] + "_active.svg";
    this.img.nativeElement.style.scale = "1.05";
  }

  /**
   * Sets the image source back to the hover state and scales the image back
   * down to its original size to give the user feedback that the button is no
   * longer active.
   */
  setBack() {
    this.img.nativeElement.src = this.img.nativeElement.src.split("_")[0] + "_hover.svg";
    this.img.nativeElement.style.scale = "1";
  }
}
