import { Component } from '@angular/core';

@Component({
  selector: 'app-workspace-menu',
  standalone: true,
  imports: [],
  templateUrl: './workspace-menu.component.html',
  styleUrl: './workspace-menu.component.scss'
})
export class WorkspaceMenuComponent {
  areChannelsOpen: boolean = false;
  openChannels() {
    if (this.areChannelsOpen) {
      this.areChannelsOpen = false;
    } else {
      this.areChannelsOpen = true;
    }
  }

}
