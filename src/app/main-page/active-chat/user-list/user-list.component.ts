import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FirebaseService } from '../../../services/firebase/firebase.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent {
  firebase = inject(FirebaseService);
  @Input() users: User[] = [];
  @Output() userSelectedEvent: EventEmitter<User> = new EventEmitter();

  /**
   * Selects a user from the user list and emits the userSelectedEvent with the selected user.
   * @param user The user to be selected.
   * @param event The event that triggered this function.
   */
  selectUser(user: User, event: Event) {
    event.stopPropagation();
    this.userSelectedEvent.emit(user);
  }
}
