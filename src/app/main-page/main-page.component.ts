import { Component, inject } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { ThreadChatComponent } from "./thread-chat/thread-chat.component";
import { ActiveChatComponent } from './active-chat/active-chat.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ShowProfileService } from '../services/show-profile/show-profile.service';

@Component({
    selector: 'app-main-page',
    standalone: true,
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss',
    imports: [
        HeaderComponent,
        WorkspaceMenuComponent,
        ActiveChatComponent,
        ThreadChatComponent,
        UserProfileComponent
    ]
})
export class MainPageComponent {
    public showProfileService: ShowProfileService = inject(ShowProfileService);

    public showWorkSpace: boolean = true;

    public handleWorkSpace() {
        this.showWorkSpace = !this.showWorkSpace;
    }
}