import {
  Component,
  computed,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  CreateStoreRequest
} from '../../../../common/models/store.model';

import {
  MyProfileResponse
} from '../../../../common/models/profile.model';

import { ProfileService } from '../../../../common/services/profile.service';
import { DropdownComponent } from '../../../../shared/component/dropdown/dropdown';
import { DropdownOption } from '../../../../shared/component/dropdown/dropdown';

export type StoreAddSubmit = CreateStoreRequest;

@Component({
  selector: 'app-pop-up-store-add',
  imports: [
    FormsModule,
    DropdownComponent
  ],
  templateUrl: './pop-up-store-add.html'
})
export class PopUpStoreAdd {
  private readonly profileService = inject(ProfileService);

  isSubmitting = input(false);

  closed = output<void>();
  submitted = output<StoreAddSubmit>();

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  formOwnerAccountId = signal<number | null>(null);
  formStoreName = signal('');
  formPhoneNumber = signal('');
  formAddress = signal('');
  formDescription = signal('');

  agents = signal<MyProfileResponse[]>([]);
  isLoadingAgents = signal(false);

  agentOptions = computed<DropdownOption[]>(() =>
    this.agents().map(agent => ({
      label:
        agent.profile?.fullName ||
        agent.account.username ||
        agent.account.email,
      value: agent.account.id
    }))
  );

  constructor() {
    this.loadAgents();
  }

  loadAgents(): void {
    this.isLoadingAgents.set(true);

    this.profileService
      .getAllAgentProfiles(1, 1000)
      .subscribe({
        next: (res) => {
          this.agents.set(res.items ?? []);
        },
        complete: () => {
          this.isLoadingAgents.set(false);
        },
        error: () => {
          this.isLoadingAgents.set(false);
        }
      });
  }

  close(): void {
    this.closed.emit();
  }

  onAgentChange(value: any): void {
    this.formOwnerAccountId.set(Number(value));
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile.set(null);
      this.previewUrl.set(null);
      return;
    }

    const file = input.files[0];

    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  submit(): void {
    if (!this.formOwnerAccountId()) return;

    this.submitted.emit({
      storeName: this.formStoreName(),
      ownerAccountId: this.formOwnerAccountId()!,
      thumbnailFile: this.selectedFile(),
      phoneNumber: this.formPhoneNumber() || null,
      address: this.formAddress() || null,
      description: this.formDescription() || null
    });
  }
}