import {
    Component,
    computed,
    inject,
    signal
} from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../../../common/services/order.service';
import { ToastService } from '../../../common/services/toast.service';
import { OrderResponse } from '../../../common/models/order.model';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';
import { PaginationComponent } from '../../../shared/component/pagination/pagination';
import { UserOrderPaymentPopupComponent } from './user-order-payment-popup/user-order-payment-popup';

@Component({
    selector: 'app-page-user-order-history',
    imports: [
        PaginationComponent,
        UserOrderPaymentPopupComponent
    ],
    templateUrl: './user-histories.html'
})
export class PageUserOrderHistoryComponent {
    private readonly router = inject(Router);
    private readonly orderService = inject(OrderService);
    private readonly toastService = inject(ToastService);

    orders = signal<OrderResponse[]>([]);
    selectedOrder = signal<OrderResponse | null>(null);

    loading = signal(false);

    page = signal(1);
    pageSize = signal(10);
    totalRecords = signal(0);

    totalPages = computed(() =>
        Math.ceil(this.totalRecords() / this.pageSize())
    );

    constructor() {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading.set(true);

        this.orderService.getMyOrders(
            this.page(),
            this.pageSize()
        ).subscribe({
            next: response => {
                this.loading.set(false);
                this.orders.set(response.items);
                this.totalRecords.set(response.totalRecords);
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được lịch sử đơn hàng');
            }
        });
    }

    openPayment(order: OrderResponse): void {
        this.selectedOrder.set(order);
    }

    closePayment(): void {
        this.selectedOrder.set(null);
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadOrders();
    }

    back(): void {
        this.router.navigate([
            '/',
            URL_ENDPOINT.USER,
            URL_ENDPOINT.USER_STORES
        ]);
    }

    formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }

    formatDate(value: string): string {
        return new Date(value).toLocaleString('vi-VN');
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

    getOrderStatusBadgeClass(status: string): string {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
            case 'CONFIRMED':
                return 'bg-blue-50 text-blue-700 ring-blue-600/20';
            case 'PROCESSING':
                return 'bg-purple-50 text-purple-700 ring-purple-600/20';
            case 'COMPLETED':
                return 'bg-green-50 text-green-700 ring-green-600/20';
            case 'CANCELLED':
                return 'bg-red-50 text-red-700 ring-red-600/20';
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    }

    getPaymentStatusBadgeClass(status: string): string {
        switch (status) {
            case 'UNPAID':
                return 'bg-orange-50 text-orange-700 ring-orange-600/20';
            case 'PAID':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
            default:
                return 'bg-gray-50 text-gray-700 ring-gray-600/20';
        }
    }
}