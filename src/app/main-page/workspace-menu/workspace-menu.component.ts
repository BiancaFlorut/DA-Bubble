import { Component, inject } from '@angular/core';
import { FirebaseService } from '../../services/firebase/firebase.service';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {
  areChannelsMenuOpen: boolean = false;
  areDirectChatsMenuOpen: boolean = false;
  firebase: FirebaseService = inject(FirebaseService);

  openChannelsMenu() {
    if (this.areChannelsMenuOpen) {
      this.areChannelsMenuOpen = false;
    } else {
      this.areChannelsMenuOpen = true;
    }
  }

  openDirectChatsMenu() {
    if (this.areDirectChatsMenuOpen) {
      this.areDirectChatsMenuOpen = false;
    } else {
      this.areDirectChatsMenuOpen = true;
    }
  }
}
