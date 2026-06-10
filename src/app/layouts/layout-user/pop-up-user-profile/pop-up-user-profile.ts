import { Component, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../common/services/profile.service';
import { ToastService } from '../../../common/services/toast.service';
import { UpdateAccountProfileRequest } from '../../../common/models/profile.model';
import { DropdownComponent, DropdownOption } from "../../../shared/component/dropdown/dropdown";

@Component({
  selector: 'app-user-profile-popup',
  standalone: true,
  imports: [FormsModule, DropdownComponent],
  templateUrl: './pop-up-user-profile.html'
})
export class UserProfilePopupComponent {
  private readonly profileService = inject(ProfileService);
  private readonly toastService = inject(ToastService);

  @Output() closed = new EventEmitter<void>();

  loading = signal(false);
  saving = signal(false);
  isCreateMode = signal(false);
  avatarPreview = signal<string>('');

  form = signal<UpdateAccountProfileRequest>({
    fullName: '',
    avatarUrl: undefined,
    phoneNumber: '',
    gender: '',
    dateOfBirth: '',
    address: ''
  });

  constructor() {
    this.loadProfile();
  }

  close(): void {
    this.closed.emit();
  }

  genderOptions: DropdownOption[] = [
    { label: 'Nam', value: 'Nam' },
    { label: 'Nữ', value: 'Nữ' }
  ];

  loadProfile(): void {
    this.loading.set(true);

    this.profileService.getMyProfile().subscribe({
      next: res => {
        const profile = res.data?.profile;

        if (!profile) {
          this.isCreateMode.set(true);
          this.loading.set(false);
          return;
        }

        this.isCreateMode.set(false);

        this.form.set({
          fullName: profile.fullName || '',
          avatarUrl: undefined,
          phoneNumber: profile.phoneNumber || '',
          gender: profile.gender || '',
          dateOfBirth: profile.dateOfBirth || '',
          address: profile.address || ''
        });

        this.avatarPreview.set(profile.avatarUrl || '');
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Không tải được hồ sơ');
      }
    });
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.form.update(current => ({
      ...current,
      avatarUrl: file
    }));

    this.avatarPreview.set(URL.createObjectURL(file));
  }

  updateField<K extends keyof UpdateAccountProfileRequest>(
    key: K,
    value: UpdateAccountProfileRequest[K]
  ): void {
    this.form.update(current => ({
      ...current,
      [key]: value
    }));
  }

  save(): void {
    if (!this.form().fullName?.trim()) {
      this.toastService.error('Vui lòng nhập họ tên');
      return;
    }

    this.saving.set(true);

    const request$ = this.isCreateMode()
      ? this.profileService.createAccountProfile(this.form())
      : this.profileService.updateAccountProfile(this.form());

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toastService.success(
          this.isCreateMode()
            ? 'Tạo hồ sơ thành công'
            : 'Cập nhật hồ sơ thành công'
        );
        this.close();
      },
      error: () => {
        this.saving.set(false);
        this.toastService.error(
          this.isCreateMode()
            ? 'Không tạo được hồ sơ'
            : 'Không cập nhật được hồ sơ'
        );
      }
    });
  }

  getGenderText(gender: string): string {
    switch (gender) {
      case 'Nam':
        return 'Nam';
      case 'Nữ':
        return 'Nữ';
      default:
        return 'Chưa cập nhật';
    }
  }

  updateGender(option: DropdownOption | null): void {
    this.updateField('gender', option?.value?.toString() || '');
  }

  blockNonNumber(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
    }
  }

  onPhonePaste(event: ClipboardEvent): void {
    event.preventDefault();

    const text = event.clipboardData?.getData('text') || '';
    const phoneNumber = text.replace(/\D/g, '').slice(0, 10);

    this.form.update(current => ({
      ...current,
      phoneNumber
    }));
  }

  updatePhoneNumber(value: string): void {
    const phoneNumber = value.replace(/\D/g, '').slice(0, 10);

    this.form.update(current => ({
      ...current,
      phoneNumber
    }));
  }
}