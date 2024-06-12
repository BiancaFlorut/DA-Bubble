import { Component, inject } from '@angular/core';
import { FormGroup, FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { onSnapshot } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase/firebase.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Post } from '../../interfaces/post';

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
  public validEmail!: boolean;
  public userForm!: FormGroup;
  private mailTest: boolean = true;
  public currentEmail: string = '';

  private firebase = inject(FirebaseService);
  private http: HttpClient = inject(HttpClient);

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
        this.createdUser.push(user.data());
      });
    });
  }

  public onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && !this.mailTest) {
      this.submitForm(ngForm);
    } else if (ngForm.submitted && ngForm.form.valid && this.mailTest) {
      ngForm.resetForm();
    }
    this.emailExisting();
  }

  private submitForm(ngForm: NgForm) {
    this.http.post(this.post.endPoint, this.post.body('http://localhost:4200/landing-page/login/change-password'))
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

  private emailExisting() {
    const emailExists = this.createdUser.some(user => user.email === this.currentEmail);
    if (!emailExists) {
      this.validEmail = true;
      setTimeout(() => {
        this.validEmail = false;
      }, 2000);
    }
  }
}
