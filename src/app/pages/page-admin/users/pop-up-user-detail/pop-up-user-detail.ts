import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileResponse } from '../../../../common/models/profile.model';

@Component({
  selector: 'app-pop-up-user-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pop-up-user-detail.html',
  styleUrl: './pop-up-user-detail.css'
})
export class PopUpUserDetailComponent {
  @Input({ required: true }) user!: UserProfileResponse;
  @Input({ required: true }) isOpen!: boolean;

  @Output() closed = new EventEmitter<void>();

  get displayName(): string {
    return this.user.profile?.fullName || this.user.account.username;
  }

  get avatarText(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

  close(): void {
    this.closed.emit();
  }
}