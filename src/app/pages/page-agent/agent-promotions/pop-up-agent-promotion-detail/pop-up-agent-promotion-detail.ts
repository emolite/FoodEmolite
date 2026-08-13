import { Component, input, output } from '@angular/core';
import { PromotionResponse } from '../../../../common/models/promotion.model';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

@Component({
    selector: 'app-pop-up-agent-promotion-detail',
    imports: [],
    templateUrl: './pop-up-agent-promotion-detail.html'
})
export class PopUpAgentPromotionDetailComponent {
    promotion = input.required<PromotionResponse>();
    isOpen = input.required<boolean>();
    isSubmitting = input.required<boolean>();

    closed = output<void>();
    pause = output<number>();
    resume = output<number>();
    cancel = output<number>();
    delete = output<number>();
    edit = output<PromotionResponse>();

    close(): void {
        this.closed.emit();
    }

    onEdit(): void {
        this.edit.emit(this.promotion());
    }

    onPause(): void {
        this.pause.emit(this.promotion().id);
    }

    onResume(): void {
        this.resume.emit(this.promotion().id);
    }

    onCancel(): void {
        this.cancel.emit(this.promotion().id);
    }

    onDelete(): void {
        this.delete.emit(this.promotion().id);
    }

    getPromotionTypeText(type: string): string {
        switch (type) {
            case 'FIXED_PRICE':
                return 'Đồng giá';
            case 'PRODUCT_DISCOUNT':
                return 'Giảm giá sản phẩm';
            case 'BUY_X_GET_Y':
                return 'Mua X tặng Y';
            default:
                return type;
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'DRAFT':
                return 'Nháp';
            case 'SCHEDULED':
                return 'Sắp diễn ra';
            case 'ACTIVE':
                return 'Đang diễn ra';
            case 'PAUSED':
                return 'Tạm dừng';
            case 'ENDED':
                return 'Kết thúc';
            default:
                return status;
        }
    }

    getConditionText(promotion: PromotionResponse): string {
        switch (promotion.conditionType) {
            case 'MIN_ORDER_AMOUNT':
                return `Đơn hàng tối thiểu ${this.formatCurrency(promotion.conditionMinAmount ?? 0)}`;
            case 'MIN_QUANTITY':
                return `Mua tối thiểu ${promotion.conditionMinQuantity ?? 0} món`;
            default:
                return 'Không yêu cầu điều kiện';
        }
    }

    getDaysOfWeekText(mask: number): string {
        if (mask >= 127) {
            return 'Tất cả các ngày trong tuần';
        }

        const days = DAY_LABELS.filter((_, index) => (mask & (1 << index)) !== 0);

        return days.length ? days.join(', ') : 'Không có ngày áp dụng';
    }

    getTimeRangeText(promotion: PromotionResponse): string {
        if (!promotion.startTime || !promotion.endTime) {
            return 'Cả ngày';
        }

        return `${promotion.startTime.slice(0, 5)} - ${promotion.endTime.slice(0, 5)}`;
    }

    formatDate(value: string): string {
        return new Date(value).toLocaleDateString('vi-VN');
    }

    formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }
}
