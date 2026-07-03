import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  CreateStoreFoodCategoryRequest
} from '../../../../common/models/store-food-category.model';

@Component({
  selector: 'app-pop-up-agent-food-category-add',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './pop-up-agent-food-category-add.html'
})
export class PopUpAgentFoodCategoryAddComponent {
  @Input()
  isSubmitting = false;

  @Output()
  closed =
    new EventEmitter<void>();

  @Output()
  submitted =
    new EventEmitter<CreateStoreFoodCategoryRequest>();

  readonly form =
    signal<CreateStoreFoodCategoryRequest>({
      categoryName: '',
      description: ''
    });

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    const value =
      this.form();

    if (!value.categoryName.trim()) {
      return;
    }

    this.submitted.emit({
      categoryName:
        value.categoryName.trim(),

      description:
        value.description?.trim() || ''
    });
  }
}