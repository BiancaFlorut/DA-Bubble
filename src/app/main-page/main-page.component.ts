import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { FirebaseService } from '../services/firebase/firebase.service';
import { User } from '../interfaces/user';
import { Unsubscribe } from 'firebase/app-check';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private firebase: FirebaseService = inject(FirebaseService);

  public currentUser: User = {
    name: '',
    email: '',
    avatar: '',
    password: ''
  };

  private unsubscribe: Unsubscribe | null = null;

  ngOnInit(): void {
    this.getUser();
  }

  ngOnDestroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  public getUser() {
    this.route.params.subscribe((params) => {
      return onSnapshot(this.firebase.getUsers(), (users) => {
        users.forEach((user) => {
          if (user.id === params['id']) {
            this.currentUser = user.data() as User;
          } else if (params['id'] === 'guest') {
            this.currentUser.name = 'Guest';
            this.currentUser.email = 'guest@gmail.com';
            this.currentUser.avatar = './assets/img/profile.png';
            this.currentUser.password = '';
          }
        });
      });
    });
  }
}