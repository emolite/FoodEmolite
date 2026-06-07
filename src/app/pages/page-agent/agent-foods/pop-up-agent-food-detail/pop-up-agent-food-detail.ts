import { Component, EventEmitter, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  StoreFoodResponse,
  UpdateStoreFoodRequest
} from '../../../../common/models/store-food.model';

@Component({
  selector: 'app-pop-up-agent-food-detail',
  imports: [
    FormsModule
  ],
  templateUrl: './pop-up-agent-food-detail.html'
})
export class PopUpAgentFoodDetailComponent implements OnChanges {
  @Input() food!: StoreFoodResponse;
  @Input() isOpen = false;
  @Input() isSubmitting = false;

  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<UpdateStoreFoodRequest>();
  @Output() deleted = new EventEmitter<number>();

  thumbnailPreview = signal<string | null>(null);

  form = signal<UpdateStoreFoodRequest>({
    foodName: '',
    thumbnailFile: null,
    thumbnailUrl: null,
    description: '',
    price: 0,
    quantity: 0,
    isAvailable: true
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['food'] && this.food) {
      this.form.set({
        foodName: this.food.foodName,
        thumbnailFile: null,
        thumbnailUrl: this.food.thumbnailUrl,
        description: this.food.description,
        price: this.food.price,
        quantity: this.food.quantity,
        isAvailable: this.food.isAvailable
      });

      this.thumbnailPreview.set(this.food.thumbnailUrl);
    }
  }

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
    this.submitted.emit(this.form());
  }

  delete(): void {
    this.deleted.emit(this.food.id);
  }

  close(): void {
    this.closed.emit();
  }
}