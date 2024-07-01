import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { Message } from '../../../../../models/message.class';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { UserService } from '../../../../../services/user/user.service';
import { Emoji } from '../../../../../models/emoji.class';

@Component({
  selector: 'app-reaction-bar',
  standalone: true,
  imports: [SvgButtonComponent],
  templateUrl: './reaction-bar.component.html',
  styleUrl: './reaction-bar.component.scss'
})
export class ReactionBarComponent {

  @Input() editable: boolean = false;
  @Input() message!: Message;
  @Output() editMessageEvent = new EventEmitter<Message>();
  isMessageMenuOpen: boolean = false;
  @ViewChild('messageMenu') messageMenu!: ElementRef;
  userService = inject(UserService);

  constructor() {
    this.userService.sortEmojis();
  }

  toggleMessageMenu() {
    this.isMessageMenuOpen = !this.isMessageMenuOpen;
    if (this.isMessageMenuOpen) {
      setTimeout(() => {
        this.isMessageMenuOpen = false;
      }, 2000);
    }
  }

  editMessage() {
    this.editMessageEvent.emit();
    this.isMessageMenuOpen = false;
  }

  addReaction(id: string) {
    const indexUser = this.userService.emojis.findIndex(e => e.id === id);
    if (indexUser != -1) {
      this.userService.emojis[indexUser].count++;
      const index = this.message.emojis.findIndex(e => e.id === id);
      if (index != -1) {
        if (!this.message.emojis[index].uids.includes(this.userService.firebase.currentUser.uid!))
        this.message.emojis[index].count++;
        this.message.emojis[index].uids.push(this.userService.firebase.currentUser.uid!);
      } else {
        const emoji = new Emoji(id,this.userService.emojis[indexUser].path, this.userService.firebase.currentUser.uid!);
        emoji.count = 1;
        this.message.emojis.push(emoji);
      }
      this.userService.sortEmojis();
      this.editMessageEvent.emit(this.message);
    } else {
      console.log('no emoji found in user service');
    }
  }

}
