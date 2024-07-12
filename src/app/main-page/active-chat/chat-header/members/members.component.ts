import { Component, inject } from '@angular/core';
import { ChannelModalService } from '../../../../services/channel-modal/channel-modal.service';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../../../services/firebase/firebase.service';
import { ShowProfileService } from '../../../../services/show-profile/show-profile.service';
import { EditUserProfileService } from '../../../../services/edit-user-profile/edit-user-profile.service';
import { EditUserProfileComponent } from '../../../edit-user-profile/edit-user-profile.component';
import { FirebaseChannelService } from '../../../../services/firebase-channel/firebase-channel.service';
import { User } from '../../../../interfaces/user';
import { UserProfileService } from '../../../../services/user-profile/user-profile.service';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule,
    EditUserProfileComponent
  ],
  templateUrl: './members.component.html',
  styleUrl: './members.component.scss'
})
export class MembersComponent {
  public channelModalService: ChannelModalService = inject(ChannelModalService);
  public firebaseService: FirebaseService = inject(FirebaseService);
  public firebaseChannelService: FirebaseChannelService = inject(FirebaseChannelService);
  public showProfileService: ShowProfileService = inject(ShowProfileService);
  private userProfileService: UserProfileService = inject(UserProfileService);
  public editUserProfileService: EditUserProfileService = inject(EditUserProfileService);

  public openAddPeople(event: Event) {
    event.stopPropagation();
    this.channelModalService.toggleShowMembers();
    this.channelModalService.toggleShowAddPeople();
  }

  public openUserProfile() {
    this.showProfileService.toggleShowProfile();
    this.channelModalService.closeAllModals();
  }

  public openUserDetails(id: string, user: User): void {
    if (id === this.firebaseService.currentUser.uid) {
      this.editUserProfileService.toggleShowProfile();
    } else {
      this.showProfileService.toggleShowProfile();
      this.userProfileService.showUserDetails(user);
    }
  }
}
