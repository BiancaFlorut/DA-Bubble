import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {
  reactions = [
    './assets/img/main-page/reactions/emoji _nerd face_.svg', 
    './assets/img/main-page/reactions/emoji _person raising both hands in celebration_.svg',
    './assets/img/main-page/reactions/emoji _rocket_.svg',
    './assets/img/main-page/reactions/emoji _white heavy check mark_.svg'
    ];
    @Input() editable: boolean = false;

    enterSource(elem : any) {
      let img = elem.target as HTMLImageElement;
      img.src = img.src.split(".svg")[0] + "_hover.svg";
    }
    leaveSource(elem : any) {
      let img = elem.target as HTMLImageElement;
      img.src = img.src.split("_hover.svg")[0] + ".svg";
    }
}
