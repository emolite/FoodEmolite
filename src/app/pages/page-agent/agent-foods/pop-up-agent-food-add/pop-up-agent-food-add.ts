import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateStoreFoodRequest } from '../../../../common/models/store-food.model';

@Component({
  selector: 'app-pop-up-agent-food-add',
  imports: [FormsModule],
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
    quantity: 0,
    optionGroups: []
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

  addOptionGroup(): void {
    this.form.update(value => ({
      ...value,
      optionGroups: [
        ...value.optionGroups,
        {
          groupName: '',
          isRequired: false,
          minSelect: 0,
          maxSelect: 1,
          sortOrder: value.optionGroups.length,
          options: []
        }
      ]
    }));
  }

  removeOptionGroup(groupIndex: number): void {
    this.form.update(value => ({
      ...value,
      optionGroups: value.optionGroups.filter((_, index) => index !== groupIndex)
    }));
  }

  addOption(groupIndex: number): void {
    this.form.update(value => {
      const optionGroups = [...value.optionGroups];
      const group = { ...optionGroups[groupIndex] };

      group.options = [
        ...group.options,
        {
          optionName: '',
          additionalPrice: 0,
          isAvailable: true,
          sortOrder: group.options.length
        }
      ];

      optionGroups[groupIndex] = group;

      return {
        ...value,
        optionGroups
      };
    });
  }

  removeOption(groupIndex: number, optionIndex: number): void {
    this.form.update(value => {
      const optionGroups = [...value.optionGroups];
      const group = { ...optionGroups[groupIndex] };

      group.options = group.options.filter((_, index) => index !== optionIndex);
      optionGroups[groupIndex] = group;

      return {
        ...value,
        optionGroups
      };
    });
  }

  private normalizeOptionGroups(): void {
    this.form.update(value => ({
      ...value,
      optionGroups: value.optionGroups.map((group, groupIndex) => ({
        ...group,
        minSelect: group.isRequired ? 1 : 0,
        maxSelect: 1,
        sortOrder: groupIndex,
        options: group.options.map((option, optionIndex) => ({
          ...option,
          sortOrder: optionIndex,
          isAvailable: option.isAvailable ?? true,
          additionalPrice: option.additionalPrice ?? 0
        }))
      }))
    }));
  }

  submit(): void {
    this.normalizeOptionGroups();

    this.submitted.emit({
      ...this.form(),
      storeRefCode: this.storeRefCode
    });
  }

  close(): void {
    this.closed.emit();
  }
}