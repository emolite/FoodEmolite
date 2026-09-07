import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../../common/services/toast.service';
import { DropdownComponent, DropdownOption } from '../../../../shared/component/dropdown/dropdown';
import { DatePickerComponent } from '../../../../shared/component/date-picker/date-picker';
import {
    CreatePromotionRequest,
    PromotionConditionType,
    PromotionDiscountItemRequest,
    PromotionDiscountType,
    PromotionFixedPriceItemRequest,
    PromotionGiftItemRequest,
    PromotionResponse,
    PromotionType
} from '../../../../common/models/promotion.model';

interface FixedPriceRow {
    storeFoodId: number | null;
    fixedPrice: number;
}

interface DiscountRow {
    storeFoodId: number | null;
    discountType: PromotionDiscountType;
    discountValue: number;
    maxDiscountAmount: number | null;
}

interface GiftRow {
    storeFoodId: number | null;
    giftQuantity: number;
}

interface PromotionFormState {
    promotionCode: string;
    promotionType: PromotionType;
    name: string;
    description: string;
    startDate: string;
    hasEndDate: boolean;
    endDate: string;
    allDay: boolean;
    startTime: string;
    endTime: string;
    selectedDays: boolean[];
    conditionType: PromotionConditionType;
    conditionMinAmount: number;
    conditionMinQuantity: number;

    // Chỉ dùng khi promotionType = PRODUCT_DISCOUNT
    applyToAllProducts: boolean;
    allDiscountType: PromotionDiscountType;
    allDiscountValue: number;
    allMaxDiscountAmount: number | null;
}

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

@Component({
    selector: 'app-pop-up-agent-promotion-add',
    imports: [CommonModule, FormsModule, DropdownComponent, DatePickerComponent],
    templateUrl: './pop-up-agent-promotion-add.html'
})
export class PopUpAgentPromotionAddComponent implements OnInit {
    @Input() foodOptions: DropdownOption[] = [];
    @Input() isSubmitting = false;
    @Input() editingPromotion: PromotionResponse | null = null;

    @Output() closed = new EventEmitter<void>();
    @Output() submitted = new EventEmitter<CreatePromotionRequest>();

    private readonly toastService = inject(ToastService);

    readonly dayLabels = DAY_LABELS;

    get isEditMode(): boolean {
        return !!this.editingPromotion;
    }

    form = signal<PromotionFormState>({
        promotionCode: '',
        promotionType: 'FIXED_PRICE',
        name: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        hasEndDate: false,
        endDate: '',
        allDay: true,
        startTime: '',
        endTime: '',
        selectedDays: [true, true, true, true, true, true, true],
        conditionType: 'NONE',
        conditionMinAmount: 0,
        conditionMinQuantity: 0,
        applyToAllProducts: false,
        allDiscountType: 'PERCENT',
        allDiscountValue: 0,
        allMaxDiscountAmount: null
    });

    fixedPriceRows = signal<FixedPriceRow[]>([
        { storeFoodId: null, fixedPrice: 0 }
    ]);

    discountRows = signal<DiscountRow[]>([
        { storeFoodId: null, discountType: 'PERCENT', discountValue: 0, maxDiscountAmount: null }
    ]);

    giftRows = signal<GiftRow[]>([
        { storeFoodId: null, giftQuantity: 1 }
    ]);

    ngOnInit(): void {
        const promo = this.editingPromotion;

        if (!promo) {
            return;
        }

        const selectedDays = Array.from(
            { length: 7 },
            (_, index) => (promo.daysOfWeekMask & (1 << index)) !== 0
        );

        this.form.set({
            promotionCode: promo.promotionCode ?? '',
            promotionType: promo.promotionType,
            name: promo.name,
            description: promo.description ?? '',
            startDate: promo.startDate,
            hasEndDate: !!promo.endDate,
            endDate: promo.endDate ?? '',
            allDay: !promo.startTime || !promo.endTime,
            startTime: promo.startTime ? promo.startTime.slice(0, 5) : '',
            endTime: promo.endTime ? promo.endTime.slice(0, 5) : '',
            selectedDays,
            conditionType: promo.conditionType,
            conditionMinAmount: promo.conditionMinAmount ?? 0,
            conditionMinQuantity: promo.conditionMinQuantity ?? 0,
            applyToAllProducts: promo.applyToAllProducts,
            allDiscountType: promo.discountType ?? 'PERCENT',
            allDiscountValue: promo.discountValue ?? 0,
            allMaxDiscountAmount: promo.maxDiscountAmount
        });

        if (promo.fixedPriceItems.length) {
            this.fixedPriceRows.set(promo.fixedPriceItems.map(item => ({
                storeFoodId: item.storeFoodId,
                fixedPrice: item.fixedPrice
            })));
        }

        if (promo.discountItems.length) {
            this.discountRows.set(promo.discountItems.map(item => ({
                storeFoodId: item.storeFoodId,
                discountType: item.discountType,
                discountValue: item.discountValue,
                maxDiscountAmount: item.maxDiscountAmount
            })));
        }

        if (promo.giftItems.length) {
            this.giftRows.set(promo.giftItems.map(item => ({
                storeFoodId: item.storeFoodId,
                giftQuantity: item.giftQuantity
            })));
        }
    }

    selectType(type: PromotionType): void {
        this.form.update(v => ({ ...v, promotionType: type }));
    }

    onStartDateChange(value: string): void {
        this.form.update(v => ({ ...v, startDate: value }));
    }

    onEndDateChange(value: string): void {
        this.form.update(v => ({ ...v, endDate: value }));
    }

    toggleDay(index: number): void {
        this.form.update(v => {
            const days = [...v.selectedDays];
            days[index] = !days[index];
            return { ...v, selectedDays: days };
        });
    }

    setConditionType(type: PromotionConditionType): void {
        this.form.update(v => ({ ...v, conditionType: type }));
    }

    toggleApplyToAllProducts(): void {
        this.form.update(v => ({ ...v, applyToAllProducts: !v.applyToAllProducts }));
    }

    setAllDiscountType(type: PromotionDiscountType): void {
        this.form.update(v => ({ ...v, allDiscountType: type }));
    }

    setAllDiscountValue(value: number): void {
        this.form.update(v => ({ ...v, allDiscountValue: value }));
    }

    setAllMaxDiscountAmount(value: number | null): void {
        this.form.update(v => ({ ...v, allMaxDiscountAmount: value }));
    }

    addFixedPriceRow(): void {
        this.fixedPriceRows.update(rows => [...rows, { storeFoodId: null, fixedPrice: 0 }]);
    }

    removeFixedPriceRow(index: number): void {
        this.fixedPriceRows.update(rows => rows.filter((_, i) => i !== index));
    }

    onFixedPriceFoodChange(index: number, option: DropdownOption | null): void {
        this.fixedPriceRows.update(rows =>
            rows.map((row, i) => i === index ? { ...row, storeFoodId: option ? Number(option.value) : null } : row)
        );
    }

    selectAllFixedPriceFoods(): void {
        const existingIds = new Set(
            this.fixedPriceRows().map(r => r.storeFoodId).filter((id): id is number => id !== null)
        );

        const missingRows = this.foodOptions
            .filter(option => !existingIds.has(Number(option.value)))
            .map(option => ({ storeFoodId: Number(option.value), fixedPrice: 0 }));

        if (!missingRows.length) {
            return;
        }

        this.fixedPriceRows.update(rows => [
            ...rows.filter(r => r.storeFoodId !== null),
            ...missingRows
        ]);
    }

    addDiscountRow(): void {
        this.discountRows.update(rows => [
            ...rows,
            { storeFoodId: null, discountType: 'PERCENT', discountValue: 0, maxDiscountAmount: null }
        ]);
    }

    removeDiscountRow(index: number): void {
        this.discountRows.update(rows => rows.filter((_, i) => i !== index));
    }

    onDiscountFoodChange(index: number, option: DropdownOption | null): void {
        this.discountRows.update(rows =>
            rows.map((row, i) => i === index ? { ...row, storeFoodId: option ? Number(option.value) : null } : row)
        );
    }

    selectAllDiscountFoods(): void {
        const existingIds = new Set(
            this.discountRows().map(r => r.storeFoodId).filter((id): id is number => id !== null)
        );

        const missingRows = this.foodOptions
            .filter(option => !existingIds.has(Number(option.value)))
            .map(option => ({
                storeFoodId: Number(option.value),
                discountType: 'PERCENT' as PromotionDiscountType,
                discountValue: 0,
                maxDiscountAmount: null
            }));

        if (!missingRows.length) {
            return;
        }

        this.discountRows.update(rows => [
            ...rows.filter(r => r.storeFoodId !== null),
            ...missingRows
        ]);
    }

    addGiftRow(): void {
        this.giftRows.update(rows => [...rows, { storeFoodId: null, giftQuantity: 1 }]);
    }

    removeGiftRow(index: number): void {
        this.giftRows.update(rows => rows.filter((_, i) => i !== index));
    }

    onGiftFoodChange(index: number, option: DropdownOption | null): void {
        this.giftRows.update(rows =>
            rows.map((row, i) => i === index ? { ...row, storeFoodId: option ? Number(option.value) : null } : row)
        );
    }

    selectAllGiftFoods(): void {
        const existingIds = new Set(
            this.giftRows().map(r => r.storeFoodId).filter((id): id is number => id !== null)
        );

        const missingRows = this.foodOptions
            .filter(option => !existingIds.has(Number(option.value)))
            .map(option => ({ storeFoodId: Number(option.value), giftQuantity: 1 }));

        if (!missingRows.length) {
            return;
        }

        this.giftRows.update(rows => [
            ...rows.filter(r => r.storeFoodId !== null),
            ...missingRows
        ]);
    }

    close(): void {
        this.closed.emit();
    }

    submitDraft(): void {
        this.submit(true);
    }

    submitPublish(): void {
        this.submit(false);
    }

    private submit(saveAsDraft: boolean): void {
        const value = this.form();

        if (!value.name.trim()) {
            this.toastService.error('Vui lòng nhập tên chương trình');
            return;
        }

        if (!value.startDate) {
            this.toastService.error('Vui lòng chọn ngày bắt đầu');
            return;
        }

        if (value.hasEndDate && value.endDate && value.endDate < value.startDate) {
            this.toastService.error('Ngày kết thúc phải sau ngày bắt đầu');
            return;
        }

        if (!value.allDay && (!value.startTime || !value.endTime)) {
            this.toastService.error('Vui lòng nhập đủ khung giờ áp dụng');
            return;
        }

        const daysOfWeekMask = value.selectedDays.reduce(
            (mask, selected, index) => selected ? mask | (1 << index) : mask,
            0
        );

        if (daysOfWeekMask === 0) {
            this.toastService.error('Vui lòng chọn ít nhất 1 ngày áp dụng trong tuần');
            return;
        }

        if (value.conditionType === 'MIN_ORDER_AMOUNT' && value.conditionMinAmount <= 0) {
            this.toastService.error('Vui lòng nhập số tiền tối thiểu');
            return;
        }

        if (value.conditionType === 'MIN_QUANTITY' && value.conditionMinQuantity <= 0) {
            this.toastService.error('Vui lòng nhập số lượng tối thiểu');
            return;
        }

        let fixedPriceItems: PromotionFixedPriceItemRequest[] = [];
        let discountItems: PromotionDiscountItemRequest[] = [];
        let giftItems: PromotionGiftItemRequest[] = [];

        if (value.promotionType === 'FIXED_PRICE') {
            fixedPriceItems = this.fixedPriceRows()
                .filter(r => r.storeFoodId)
                .map(r => ({ storeFoodId: r.storeFoodId as number, fixedPrice: r.fixedPrice }));

            if (!fixedPriceItems.length) {
                this.toastService.error('Vui lòng chọn ít nhất 1 món áp dụng đồng giá');
                return;
            }

            if (fixedPriceItems.some(item => item.fixedPrice <= 0)) {
                this.toastService.error('Giá đồng giá phải lớn hơn 0');
                return;
            }
        } else if (value.promotionType === 'PRODUCT_DISCOUNT') {
            if (value.applyToAllProducts) {
                if (value.allDiscountValue <= 0) {
                    this.toastService.error('Mức giảm phải lớn hơn 0');
                    return;
                }

                if (value.allDiscountType === 'PERCENT' && value.allDiscountValue > 100) {
                    this.toastService.error('Giảm theo % không được vượt quá 100%');
                    return;
                }
            } else {
                discountItems = this.discountRows()
                    .filter(r => r.storeFoodId)
                    .map(r => ({
                        storeFoodId: r.storeFoodId as number,
                        discountType: r.discountType,
                        discountValue: r.discountValue,
                        maxDiscountAmount: r.discountType === 'PERCENT' ? (r.maxDiscountAmount || null) : null
                    }));

                if (!discountItems.length) {
                    this.toastService.error('Vui lòng chọn ít nhất 1 món áp dụng giảm giá');
                    return;
                }

                if (discountItems.some(item => item.discountValue <= 0)) {
                    this.toastService.error('Mức giảm phải lớn hơn 0');
                    return;
                }

                if (discountItems.some(item => item.discountType === 'PERCENT' && item.discountValue > 100)) {
                    this.toastService.error('Giảm theo % không được vượt quá 100%');
                    return;
                }
            }
        } else {
            giftItems = this.giftRows()
                .filter(r => r.storeFoodId)
                .map((r, index) => ({
                    storeFoodId: r.storeFoodId as number,
                    giftQuantity: r.giftQuantity,
                    sortOrder: index
                }));

            if (!giftItems.length) {
                this.toastService.error('Vui lòng chọn ít nhất 1 món quà tặng');
                return;
            }

            if (giftItems.some(item => item.giftQuantity <= 0)) {
                this.toastService.error('Số lượng quà tặng phải lớn hơn 0');
                return;
            }

            if (value.conditionType === 'NONE') {
                this.toastService.error('Chương trình Mua X tặng Y cần điều kiện mua tối thiểu (mua X)');
                return;
            }
        }

        this.submitted.emit({
            promotionCode: value.promotionCode.trim() || null,
            promotionType: value.promotionType,
            name: value.name.trim(),
            description: value.description.trim() || null,
            saveAsDraft,
            startDate: value.startDate,
            endDate: value.hasEndDate ? (value.endDate || null) : null,
            startTime: value.allDay ? null : value.startTime,
            endTime: value.allDay ? null : value.endTime,
            daysOfWeekMask,
            conditionType: value.conditionType,
            conditionMinAmount: value.conditionType === 'MIN_ORDER_AMOUNT' ? value.conditionMinAmount : null,
            conditionMinQuantity: value.conditionType === 'MIN_QUANTITY' ? value.conditionMinQuantity : null,
            applyToAllProducts: value.promotionType === 'PRODUCT_DISCOUNT' ? value.applyToAllProducts : false,
            discountType: value.promotionType === 'PRODUCT_DISCOUNT' && value.applyToAllProducts ? value.allDiscountType : null,
            discountValue: value.promotionType === 'PRODUCT_DISCOUNT' && value.applyToAllProducts ? value.allDiscountValue : null,
            maxDiscountAmount: value.promotionType === 'PRODUCT_DISCOUNT' && value.applyToAllProducts && value.allDiscountType === 'PERCENT'
                ? (value.allMaxDiscountAmount || null)
                : null,
            fixedPriceItems,
            discountItems,
            giftItems
        });
    }
}
