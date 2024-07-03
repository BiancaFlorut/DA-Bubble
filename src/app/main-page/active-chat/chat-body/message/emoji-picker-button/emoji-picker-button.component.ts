import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { SvgButtonComponent } from '../../../../svg-button/svg-button.component';
import { UserService } from '../../../../../services/user/user.service';

@Component({
  selector: 'app-emoji-picker-button',
  standalone: true,
  imports: [SvgButtonComponent],
  templateUrl: './emoji-picker-button.component.html',
  styleUrl: './emoji-picker-button.component.scss'
})
export class EmojiPickerButtonComponent {
  @Output() emojiPickerEvent = new EventEmitter<string>();
  @Input() isEmojiPickerOpen: boolean = false;
  userService = inject(UserService);
  emojis = this.userService.emojis;

  selectEmoji(id: string, event: Event) {
    event.stopPropagation();
    this.isEmojiPickerOpen = false;
    this.emojiPickerEvent.emit(id);
  }

  toggleEmojiPicker() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }
}
