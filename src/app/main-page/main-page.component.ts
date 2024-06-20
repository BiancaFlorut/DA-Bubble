import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { WorkspaceMenuComponent } from './workspace-menu/workspace-menu.component';
import { RouterOutlet } from '@angular/router';
import { ThreadChatComponent } from "./thread-chat/thread-chat.component";

@Component({
    selector: 'app-main-page',
    standalone: true,
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.scss',
    imports: [
        HeaderComponent,
        WorkspaceMenuComponent,
        RouterOutlet,
        ThreadChatComponent
    ]
})
export class MainPageComponent {

}