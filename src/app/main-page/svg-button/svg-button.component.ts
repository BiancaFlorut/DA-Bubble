import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-svg-button',
  standalone: true,
  imports: [],
  templateUrl: './svg-button.component.html',
  styleUrl: './svg-button.component.scss'
})
export class SvgButtonComponent {
@Input() source: string = "";

  enterSource(elem: any) {
    let img = elem.target as HTMLImageElement;
    img.src = img.src.split(".svg")[0] + "_hover.svg";
  }
  leaveSource(elem: any) {
    let img = elem.target as HTMLImageElement;
    img.src = img.src.split("_hover.svg")[0] + ".svg";
  }
}
