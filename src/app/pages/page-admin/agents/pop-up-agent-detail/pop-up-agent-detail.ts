import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileResponse } from '../../../../common/models/profile.model';

@Component({
    selector: 'app-pop-up-agent-detail',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pop-up-agent-detail.html',
    styleUrl: './pop-up-agent-detail.css'
})
export class PopUpAgentDetailComponent {
    @Input({ required: true }) agent!: MyProfileResponse;
    @Input({ required: true }) isOpen!: boolean;

    @Output() closed = new EventEmitter<void>();

    get displayName(): string {
        return this.agent.profile?.fullName || this.agent.account.username;
    }

    get avatarText(): string {
        return this.displayName.charAt(0).toUpperCase();
    }

    close(): void {
        this.closed.emit();
    }
}