import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { User } from '../../interfaces/user';
import { Unsubscribe } from 'firebase/app-check';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private firebase: FirebaseService = inject(FirebaseService);
  private router: Router = inject(Router);
  private fb = inject(FormBuilder);

  public currentUser: User = {
    name: '',
    email: '',
    avatar: '',
    password: ''
  };

  public isUserMenuActive: boolean = false;
  public loggedAsGuest: boolean = false;
  public showProfile: boolean = false;
  public editUser: boolean = false;
  public emailIsExisting: boolean = false;
  public userForm!: FormGroup;

  private unsubscribe: Unsubscribe | null = null;

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Z][a-zA-Z]+\s[A-Z][a-zA-Z]+$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
    });
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
            this.loggedAsGuest = true;
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
    this.editUser = false;
  }

  public toggleEditMenu() {
    this.editUser = !this.editUser;
  }

  public async editUserData() {
    const inputEmail = this.userForm.get('email')?.value;
    const emailExists = this.currentUser.email === inputEmail;
    if (emailExists) {
      this.emailExisting();
    } else {
      await this.firebase.addUser(this.currentUser);
      this.toggleEditMenu();
    }
  }

  private emailExisting() {
    this.emailIsExisting = true;
    setTimeout(() => {
      this.emailIsExisting = false;
    }, 2000);
  }
}
