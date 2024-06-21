import { Component } from '@angular/core';

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
