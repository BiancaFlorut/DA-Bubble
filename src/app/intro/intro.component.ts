import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, animate, style, group, sequence } from '@angular/animations';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [],
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.scss',
  animations: [
    trigger('slideInOutAnimation', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),  // Startposition außerhalb des Bildschirms links
        animate('500ms ease-out', style({ transform: 'translate(0)', opacity: 1 }))  // Endposition im Bild
      ])
    ])
  ]
})
export class IntroComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // setTimeout(() => {
    //   this.router.navigate(['/auth/login']);
    // }, 3000);
  }
}
