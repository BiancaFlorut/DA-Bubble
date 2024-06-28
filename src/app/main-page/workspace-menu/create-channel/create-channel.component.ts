import { Component, inject } from '@angular/core';
import { CreateChannelService } from '../../../services/create-channel/create-channel.service';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  public createChannelService: CreateChannelService = inject(CreateChannelService);

  public toggleShowCreateChannel(event: Event): void {
    event.stopPropagation();
    this.createChannelService.toggleShowCreateChannel();
  }
}
