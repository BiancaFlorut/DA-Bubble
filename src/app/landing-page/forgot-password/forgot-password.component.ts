import { Component, inject } from '@angular/core';
import { FormGroup, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Post } from '../../interfaces/post';
import { UserData } from '../../interfaces/user-data';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  public createdUser!: any[];
  userData: UserData = {
    email: '',
    name: 'Passwort zurücksetzen',
    message: '',
  };

  public validEmail!: boolean;
  public userForm!: FormGroup;
  private mailTest: boolean = true;
  public showSendEmailMessage: boolean = false;

  private firebase = inject(FirebaseService);
  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  post: Post = {
    endPoint: `https://da-bubble.vitalij-schwab.com/sendMail.php`,
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };

  ngOnInit() {
    this.getUser();
  }

  public getUser() {
    return onSnapshot(this.firebase.getUsers(), (users) => {
      this.createdUser = [];
      users.forEach((user) => {
        this.createdUser.push({ id: user.id, ...user.data() });
      });
    });
  }

  public onSubmit(ngForm: NgForm) {
    this.saveEmailId();
    const emailExists = this.createdUser.some(user => user.email === this.userData.email);
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest && emailExists) {
      this.submitForm(ngForm);
      this.showEmailSentMessage();
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest && emailExists) {
      ngForm.resetForm();
      this.showEmailSentMessage();
    }
    this.emailExisting(emailExists);
  }

  private saveEmailId() {
    this.createdUser.forEach(user => {
      if (user.email === this.userData.email) {
        this.userData.message = `Bitte klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:<br><br>https://da-bubble.vitalij-schwab.com/landing-page/login/change-password/${user.id}`;
      }
    })
  }

  private submitForm(ngForm: NgForm) {
    this.http.post(this.post.endPoint, this.post.body(this.userData))
      .subscribe({
        next: (response) => {
          ngForm.resetForm();
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => console.info('send post complete'),
      });
  }

  private showEmailSentMessage() {
    this.showSendEmailMessage = true;
    setTimeout(() => {
      this.showSendEmailMessage = false;
      this.router.navigate(['./landing-page/login'])
    }, 2000);
  }

  private emailExisting(emailExists: boolean) {
    if (!emailExists) {
      this.validEmail = true;
      setTimeout(() => {
        this.validEmail = false;
      }, 2000);
    }
  }
}
