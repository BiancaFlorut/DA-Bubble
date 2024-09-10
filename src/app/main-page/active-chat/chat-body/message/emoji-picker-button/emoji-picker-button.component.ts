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

  /**
   * Event handler for when an emoji is selected from the picker.
   * The event is stopped from propagating, the picker is closed, and the selected emoji's id is emitted.
   * @param id The id of the selected emoji.
   * @param event The event that triggered this function.
   */
  selectEmoji(id: string, event: Event) {
    event.stopPropagation();
    this.isEmojiPickerOpen = false;
    this.emojiPickerEvent.emit(id);
  }

  /**
   * Toggles the emoji picker open or closed.
   * If the picker is currently open, it is closed, and if it is currently closed, it is opened.
   */
  toggleEmojiPicker() {
    this.isEmojiPickerOpen = !this.isEmojiPickerOpen;
  }

  /**
   * Closes the emoji picker if it is open.
   * Stopping propagation of the event that triggered this function.
   * @param event The event that triggered this function.
   */
  closeEmojiPicker(event: Event) {
    event.stopPropagation();
    this.isEmojiPickerOpen = false;
  }
}
