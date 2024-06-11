import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FirebaseService } from './services/firebase/firebase.service';
import { onSnapshot } from '@angular/fire/firestore';
import AOS from 'aos';
import 'aos/dist/aos.css';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  public title = 'da_bubble';
  private firebase = inject(FirebaseService);

  ngOnInit() {
    this.getUsers();
    AOS.init();
  }

  public getUsers() {
    return onSnapshot(this.firebase.getUsers(), (users) => {
      users.forEach((user) => {
        console.log(user.data());
      });
    });
  }
}
