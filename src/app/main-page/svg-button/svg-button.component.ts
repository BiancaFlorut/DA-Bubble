import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-svg-button',
  standalone: true,
  imports: [],
  templateUrl: './svg-button.component.html',
  styleUrl: './svg-button.component.scss'
})
export class SvgButtonComponent {
@Input({ required: true }) source: string = "";

  /**
   * Changes the image source of the element to append "_hover" to the original
   * filename when the mouse is hovered over the element.
   * @param elem The event object of the mouseover event.
   */
  enterSource(elem: any) {
    let img = elem.target as HTMLImageElement;
    img.src = img.src.split(".svg")[0] + "_hover.svg";
  }
  /**
   * Changes the image source of the element back to its original filename when the
   * mouse is no longer hovering over the element.
   * @param elem The event object of the mouseleave event.
   */
  leaveSource(elem: any) {
    let img = elem.target as HTMLImageElement;
    img.src = img.src.split("_hover.svg")[0] + ".svg";
  }
}
