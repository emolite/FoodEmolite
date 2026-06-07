import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateStoreFoodRequest } from '../../../../common/models/store-food.model';

@Component({
  selector: 'app-pop-up-agent-food-add',
  imports: [
    FormsModule
  ],
  templateUrl: './pop-up-agent-food-add.html'
})
export class PopUpAgentFoodAddComponent {
  @Input() storeRefCode = '';
  @Input() isSubmitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<CreateStoreFoodRequest>();

  thumbnailPreview = signal<string | null>(null);

  form = signal<CreateStoreFoodRequest>({
    storeRefCode: '',
    foodName: '',
    thumbnailFile: null,
    description: '',
    price: 0,
    quantity: 0
  });

  onThumbnailChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.form.update(value => ({
      ...value,
      thumbnailFile: file
    }));

    this.thumbnailPreview.set(URL.createObjectURL(file));
  }

  submit(): void {
    this.submitted.emit({
      ...this.form(),
      storeRefCode: this.storeRefCode
    });
  }

  close(): void {
    this.closed.emit();
  }
}