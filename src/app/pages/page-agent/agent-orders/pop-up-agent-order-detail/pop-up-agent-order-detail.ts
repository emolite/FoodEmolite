import {
    Component,
    input,
    output,
    signal
} from '@angular/core';
import {
    OrderItemResponse,
    OrderResponse,
    UpdateOrderStatusRequest
} from '../../../../common/models/order.model';

@Component({
    selector: 'app-pop-up-agent-order-detail',
    imports: [],
    templateUrl: './pop-up-agent-order-detail.html'
})
export class PopUpAgentOrderDetailComponent {
    order = input.required<OrderResponse>();
    isOpen = input.required<boolean>();
    isSubmitting = input.required<boolean>();

    closed = output<void>();
    submitted = output<UpdateOrderStatusRequest>();

    newStatus = signal('');
    changedNote = signal('');

    close(): void {
        this.closed.emit();
    }

    submit(): void {
        const status = this.newStatus();

        if (!status) {
            return;
        }

        this.submitted.emit({
            newStatus: status,
            changedNote: this.changedNote() || null
        });
    }

    getBaseUnitPrice(item: OrderItemResponse): number {
        const optionAmount = (item.options ?? []).reduce(
            (sum, option) => sum + option.additionalPrice,
            0
        );

        return item.unitPrice - optionAmount;
    }

    formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }

    getOrderStatusText(status: string): string {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'PROCESSING':
                return 'Đang chuẩn bị';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    }

    getPaymentStatusText(status: string): string {
        switch (status) {
            case 'UNPAID':
                return 'Chưa thanh toán';
            case 'PAID':
                return 'Đã thanh toán';
            default:
                return status;
        }
    }
}