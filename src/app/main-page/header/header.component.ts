import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { User } from '../../interfaces/user';
import { Unsubscribe } from 'firebase/app-check';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private firebase: FirebaseService = inject(FirebaseService);
  private router: Router = inject(Router);

  public currentUser: User = {
    name: '',
    email: '',
    avatar: '',
    password: ''
  };

  public isUserMenuActive: boolean = false;
  public showProfile: boolean = false;

  private unsubscribe: Unsubscribe | null = null;

  ngOnInit(): void {
    this.getUser();
    this.isUserLogged();
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

  private isUserLogged() {
    if (!localStorage.getItem('user')) {
      this.router.navigate(['./landing-page/login']);
    }
  }

  public toggleMenu() {
    if (this.showProfile) {
      this.showProfile = !this.showProfile;
    } else {
      this.isUserMenuActive = !this.isUserMenuActive;
    }
  }

  public toggleProfile(event: Event) {
    event.stopPropagation()
    this.showProfile = !this.showProfile;
  }
}
