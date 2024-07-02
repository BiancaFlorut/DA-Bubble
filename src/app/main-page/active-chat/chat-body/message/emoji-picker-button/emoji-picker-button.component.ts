import { Component, EventEmitter, Output, inject } from '@angular/core';
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
  isEmojiPickerOpen: boolean = false;
  @Output() emojiPickerEvent = new EventEmitter<string>();
  userService = inject(UserService);
  emojis = this.userService.emojis;

  toggleEmojiPicker() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  selectEmoji(id: string) {
    this.isEmojiPickerOpen = false;
    this.emojiPickerEvent.emit(id);
  }
}
