import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StoreFoodResponse } from '../../../../common/models/store-food.model';

export interface CartItemOption {
    optionGroupId: number;
    optionGroupName: string;
    optionId: number;
    optionName: string;
    additionalPrice: number;
}

@Component({
    selector: 'app-pop-up-user-food-options',
    imports: [FormsModule],
    templateUrl: './pop-up-user-food-options.html'
})
export class PopUpUserFoodOptionsComponent implements OnChanges {
    @Input() food!: StoreFoodResponse;
    @Input() selectedOptions: CartItemOption[] = [];

    @Output() closed = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<CartItemOption[]>();

    selectedOptionIds = signal<Record<number, number>>({});

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['selectedOptions']) {
            const map: Record<number, number> = {};

            for (const option of this.selectedOptions ?? []) {
                map[option.optionGroupId] = option.optionId;
            }

            this.selectedOptionIds.set(map);
        }
    }

    selectOption(groupId: number, optionId: number): void {
        this.selectedOptionIds.update(value => ({
            ...value,
            [groupId]: optionId
        }));
    }

    submit(): void {
        const result: CartItemOption[] = [];

        for (const group of this.food.optionGroups ?? []) {
            const selectedOptionId = this.selectedOptionIds()[group.id];

            if (group.isRequired && !selectedOptionId) {
                return;
            }

            if (!selectedOptionId) {
                continue;
            }

            const option = group.options.find(x => x.id === selectedOptionId);

            if (!option) {
                continue;
            }

            result.push({
                optionGroupId: group.id,
                optionGroupName: group.groupName,
                optionId: option.id,
                optionName: option.optionName,
                additionalPrice: option.additionalPrice
            });
        }

        this.submitted.emit(result);
    }

    isMissingRequiredGroup(groupId: number): boolean {
        const group = this.food.optionGroups?.find(x => x.id === groupId);

        if (!group?.isRequired) return false;

        return !this.selectedOptionIds()[groupId];
    }

    getSelectedTotal(): number {
        let total = this.food.price;

        for (const group of this.food.optionGroups ?? []) {
            const selectedOptionId = this.selectedOptionIds()[group.id];

            if (!selectedOptionId) continue;

            const option = group.options.find(x => x.id === selectedOptionId);

            if (option) {
                total += option.additionalPrice;
            }
        }

        return total;
    }

    formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }

    close(): void {
        this.closed.emit();
    }
}