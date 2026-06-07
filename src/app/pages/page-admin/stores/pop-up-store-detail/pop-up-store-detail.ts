import {
  Component,
  computed,
  effect,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  StoreResponse,
  UpdateStoreRequest
} from '../../../../common/models/store.model';
import { ConfirmPopupComponent } from '../../../../shared/component/confirm-popup/confirm-popup';

export type StoreDetailSubmit = UpdateStoreRequest;

@Component({
  selector: 'app-pop-up-store-detail',
  imports: [
    FormsModule,
    ConfirmPopupComponent
  ],
  templateUrl: './pop-up-store-detail.html',
  styleUrl: './pop-up-store-detail.css'
})
export class PopUpStoreDetail {
  store = input.required<StoreResponse>();
  isSubmitting = input(false);

  closed = output<void>();
  isOpen = input(false);
  submitted = output<StoreDetailSubmit>();
  deleted = output<number>();

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isConfirmDeleteOpen = signal(false);

  formStoreName = signal('');
  formPhoneNumber = signal('');
  formAddress = signal('');
  formDescription = signal('');
  formIsActive = signal(true);

  hasChanged = computed(() => {
    const store = this.store();

    return (
      this.formStoreName() !== store.storeName ||
      this.formPhoneNumber() !== (store.phoneNumber ?? '') ||
      this.formAddress() !== (store.address ?? '') ||
      this.formDescription() !== (store.description ?? '') ||
      this.formIsActive() !== store.isActive ||
      this.selectedFile() !== null
    );
  });

  constructor() {
    effect(() => {
      const store = this.store();

      this.selectedFile.set(null);
      this.previewUrl.set(store.thumbnailUrl);

      this.formStoreName.set(store.storeName);
      this.formPhoneNumber.set(store.phoneNumber ?? '');
      this.formAddress.set(store.address ?? '');
      this.formDescription.set(store.description ?? '');
      this.formIsActive.set(store.isActive);
    });
  }

  close(): void {
    this.closed.emit();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.selectedFile.set(null);
      this.previewUrl.set(this.store().thumbnailUrl);
      return;
    }

    const file = input.files[0];

    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  submit(): void {
    if (!this.hasChanged()) {
      return;
    }

    this.submitted.emit({
      storeName: this.formStoreName(),
      thumbnailFile: this.selectedFile(),
      thumbnailFileRefCode: this.store().thumbnailFileRefCode,
      phoneNumber: this.formPhoneNumber() || null,
      address: this.formAddress() || null,
      description: this.formDescription() || null,
      isActive: this.formIsActive()
    });
  }

  openConfirmDelete(): void {
    this.isConfirmDeleteOpen.set(true);
  }

  closeConfirmDelete(): void {
    this.isConfirmDeleteOpen.set(false);
  }

  confirmDelete(): void {
    this.deleted.emit(this.store().id);
  }
}