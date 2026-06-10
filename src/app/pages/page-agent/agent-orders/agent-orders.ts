import { Component, inject, signal } from '@angular/core';
import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';
import { ToastService } from '../../../common/services/toast.service';
import { OrderService } from '../../../common/services/order.service';
import { ProfileService } from '../../../common/services/profile.service';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import {
    TableColumn,
    TableRow
} from '../../../common/models/front-end/table/table-column.model';
import {
    OrderResponse,
    UpdateOrderStatusRequest,
    UpdatePaymentStatusRequest
} from '../../../common/models/order.model';
import { PopUpAgentOrderDetailComponent } from './pop-up-agent-order-detail/pop-up-agent-order-detail';
import { ConfirmPopupComponent } from '../../../shared/component/confirm-popup/confirm-popup';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface OrderFilter {
    orderStatus: string;
    paymentStatus: string;
}

@Component({
    selector: 'app-page-agent-orders',
    imports: [
        AppTableComponent,
        FilterComponent,
        PopUpAgentOrderDetailComponent,
        ConfirmPopupComponent
    ],
    templateUrl: './agent-orders.html'
})
export class PageAgentOrdersComponent {
    private readonly orderService = inject(OrderService);
    private readonly profileService = inject(ProfileService);
    private readonly toastService = inject(ToastService);
    private readonly sanitizer = inject(DomSanitizer);

    orders = signal<OrderResponse[]>([]);
    selectedOrder = signal<OrderResponse | null>(null);
    selectedOrderIds = signal<number[]>([]);
    storeRefCode = signal<string | null>(null);
    readonly isInvoicePreviewOpen = signal(false);
    readonly invoicePreviewUrl = signal<SafeResourceUrl | null>(null);

    private invoiceBlob: Blob | null = null;
    private invoiceObjectUrl: string | null = null;

    page = signal(1);
    pageSize = signal(10);
    totalPages = signal(1);
    loading = signal(false);
    isSubmitting = signal(false);
    isDetailOpen = signal(false);
    isDetailRendered = signal(false);
    isConfirmOpen = signal(false);
    confirmTitle = signal('');
    confirmMessage = signal('');
    confirmAction = signal<'PAYMENT' | 'ORDER' | null>(null);

    sortBy = signal('');
    asc = signal(false);

    filter = signal<OrderFilter>({
        orderStatus: '',
        paymentStatus: ''
    });

    columns: TableColumn[] = [
        {
            key: 'selected',
            label: '',
            width: '60px',
            align: 'center',
            type: 'checkbox'
        },
        {
            key: 'index',
            label: 'STT',
            width: '80px',
            align: 'center'
        },
        {
            key: 'orderCode',
            label: 'Mã đơn',
            width: '150px',
            align: 'left'
        },
        {
            key: 'totalAmount',
            label: 'Tổng tiền',
            width: '140px',
            align: 'right',
            sortable: true
        },
        {
            key: 'orderStatusText',
            label: 'Trạng thái đơn',
            width: '160px',
            align: 'center',
            type: 'badge'
        },
        {
            key: 'paymentStatusText',
            label: 'Thanh toán',
            width: '140px',
            align: 'center',
            type: 'badge'
        },
        {
            key: 'note',
            label: 'Ghi chú',
            width: '220px'
        },
        {
            key: 'createdAt',
            label: 'Ngày tạo',
            width: '180px',
            sortable: true
        }
    ];

    filterFields: FilterField[] = [
        {
            key: 'orderStatus',
            label: 'Trạng thái đơn',
            type: 'select',
            placeholder: 'Tất cả trạng thái',
            options: [
                {
                    label: 'Chờ xác nhận',
                    value: 'PENDING'
                },
                {
                    label: 'Đã xác nhận',
                    value: 'CONFIRMED'
                }
            ]
        },
        {
            key: 'paymentStatus',
            label: 'Thanh toán',
            type: 'select',
            placeholder: 'Tất cả thanh toán',
            options: [
                {
                    label: 'Chưa thanh toán',
                    value: 'UNPAID'
                },
                {
                    label: 'Đã thanh toán',
                    value: 'PAID'
                }
            ]
        }
    ];

    constructor() {
        this.loadMyStore();
    }

    rows(): TableRow[] {
        const filter = this.filter();

        let data = this.orders().filter(order => {
            const matchOrderStatus =
                !filter.orderStatus ||
                order.orderStatus === filter.orderStatus;

            const matchPaymentStatus =
                !filter.paymentStatus ||
                order.paymentStatus === filter.paymentStatus;

            return matchOrderStatus && matchPaymentStatus;
        });

        if (this.sortBy()) {
            data = [...data].sort((a, b) => {
                let aValue: string | number = '';
                let bValue: string | number = '';

                if (this.sortBy() === 'id') {
                    aValue = a.id;
                    bValue = b.id;
                }

                if (this.sortBy() === 'totalAmount') {
                    aValue = a.totalAmount;
                    bValue = b.totalAmount;
                }

                if (this.sortBy() === 'createdAt') {
                    aValue = new Date(a.createdAt).getTime();
                    bValue = new Date(b.createdAt).getTime();
                }

                if (aValue < bValue) {
                    return this.asc() ? -1 : 1;
                }

                if (aValue > bValue) {
                    return this.asc() ? 1 : -1;
                }

                return 0;
            });
        }

        return data.map((order, index) => ({
            selected: this.isSelected(order.id),
            index: (this.page() - 1) * this.pageSize() + index + 1,
            id: order.id,
            orderCode: order.orderCode,
            refCode: order.refCode,
            storeRefCode: order.storeRefCode,
            totalAmount: this.formatCurrency(order.totalAmount),
            orderStatus: order.orderStatus,
            orderStatusText: {
                text: this.getOrderStatusText(order.orderStatus),
                value: order.orderStatus
            },
            paymentStatus: order.paymentStatus,
            paymentStatusText: {
                text: this.getPaymentStatusText(order.paymentStatus),
                value: order.paymentStatus
            },
            note: order.note ?? '',
            createdAt: this.formatDate(order.createdAt)
        }));
    }

    loadMyStore(): void {
        this.loading.set(true);

        this.profileService.getMyProfile().subscribe({
            next: response => {
                if (!response.isSuccess || !response.data?.store?.refCode) {
                    this.loading.set(false);
                    this.toastService.error('Không tìm thấy cửa hàng của đại lý');
                    return;
                }

                this.storeRefCode.set(response.data.store.refCode);
                this.loadOrders();
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được thông tin đại lý');
            }
        });
    }

    loadOrders(): void {
        const refCode = this.storeRefCode();

        if (!refCode) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);

        this.orderService.getByStoreRefCode(
            refCode,
            this.page(),
            this.pageSize()
        ).subscribe({
            next: response => {
                this.orders.set(response.items);
                this.totalPages.set(response.totalPages);
                this.selectedOrderIds.set([]);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được danh sách đơn hàng');
            }
        });
    }

    openDetail(row: TableRow): void {
        const id = Number(row['id']);
        const order = this.orders().find(x => x.id === id);

        if (!order) {
            return;
        }

        this.selectedOrder.set(order);
        this.isDetailRendered.set(true);
        this.isDetailOpen.set(true);
    }

    previewInvoiceSelected(): void {
        const orderIds = this.selectedOrderIds();

        if (orderIds.length === 0) return;

        this.isSubmitting.set(true);

        this.orderService.printOrders({ orderIds }).subscribe({
            next: (blob) => {
                this.clearInvoiceObjectUrl();

                this.invoiceBlob = blob;
                this.invoiceObjectUrl = URL.createObjectURL(blob);

                this.invoicePreviewUrl.set(
                    this.sanitizer.bypassSecurityTrustResourceUrl(this.invoiceObjectUrl)
                );

                this.isInvoicePreviewOpen.set(true);
            },
            complete: () => {
                this.isSubmitting.set(false);
            },
            error: () => {
                this.isSubmitting.set(false);
            }
        });
    }

    downloadInvoiceSelected(): void {
        const orderIds = this.selectedOrderIds();

        if (orderIds.length === 0) return;

        this.isSubmitting.set(true);

        this.orderService.printOrders({ orderIds }).subscribe({
            next: (blob) => {
                this.downloadBlob(blob);
            },
            complete: () => {
                this.isSubmitting.set(false);
            },
            error: () => {
                this.isSubmitting.set(false);
            }
        });
    }

    downloadCurrentPreviewInvoice(): void {
        if (!this.invoiceBlob) return;

        this.downloadBlob(this.invoiceBlob);
    }

    printCurrentPreviewInvoice(): void {
        if (!this.invoiceObjectUrl) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = this.invoiceObjectUrl;

        document.body.appendChild(iframe);

        iframe.onload = () => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();

            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 1000);
        };
    }

    closeInvoicePreview(): void {
        this.isInvoicePreviewOpen.set(false);
        this.invoicePreviewUrl.set(null);
        this.invoiceBlob = null;
        this.clearInvoiceObjectUrl();
    }

    private downloadBlob(blob: Blob): void {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${Date.now()}.pdf`;
        a.click();

        URL.revokeObjectURL(url);
    }

    private clearInvoiceObjectUrl(): void {
        if (this.invoiceObjectUrl) {
            URL.revokeObjectURL(this.invoiceObjectUrl);
            this.invoiceObjectUrl = null;
        }
    }

    closeDetail(): void {
        this.isDetailOpen.set(false);

        setTimeout(() => {
            this.isDetailRendered.set(false);
            this.selectedOrder.set(null);
        }, 200);
    }

    updateStatus(request: UpdateOrderStatusRequest): void {
        const order = this.selectedOrder();

        if (!order) return;

        this.isSubmitting.set(true);

        this.orderService.updateStatus(order.id, request).subscribe({
            next: response => {
                this.isSubmitting.set(false);

                if (!response.isSuccess) {
                    this.toastService.error(response.message);
                    return;
                }

                this.toastService.success(response.message);
                this.closeDetail();
                this.loadOrders();
            },
            error: () => {
                this.isSubmitting.set(false);
                this.toastService.error('Cập nhật trạng thái đơn thất bại');
            }
        });
    }

    toggleSelected(row: TableRow, checked: boolean): void {
        const id = Number(row['id']);

        if (!id) {
            return;
        }

        if (checked) {
            this.selectedOrderIds.set([
                ...new Set([...this.selectedOrderIds(), id])
            ]);
            return;
        }

        this.selectedOrderIds.set(
            this.selectedOrderIds().filter(selectedId => selectedId !== id)
        );
    }

    toggleAllSelected(checked: boolean): void {
        if (!checked) {
            this.selectedOrderIds.set([]);
            return;
        }

        const ids = this.rows()
            .map(row => Number(row['id']))
            .filter(id => !!id);

        this.selectedOrderIds.set(ids);
    }

    confirmPaymentSelected(): void {
        const selectedOrders = this.getSelectedOrders();

        const invalidOrders = selectedOrders.filter(
            order => order.paymentStatus === 'PAID'
        );

        if (invalidOrders.length) {
            this.toastService.error('Có đơn đã thanh toán trong danh sách đã chọn');
            return;
        }

        this.confirmTitle.set('Xác nhận thanh toán');
        this.confirmMessage.set(
            `Bạn có chắc muốn xác nhận thanh toán cho ${selectedOrders.length} đơn hàng đã chọn không?`
        );
        this.confirmAction.set('PAYMENT');
        this.isConfirmOpen.set(true);
    }

    confirmOrderSelected(): void {
        const selectedOrders = this.getSelectedOrders();

        const invalidOrders = selectedOrders.filter(
            order => order.orderStatus !== 'PENDING'
        );

        if (invalidOrders.length) {
            this.toastService.error('Chỉ xác nhận được đơn đang chờ xác nhận');
            return;
        }

        this.confirmTitle.set('Xác nhận đơn hàng');
        this.confirmMessage.set(
            `Bạn có chắc muốn xác nhận ${selectedOrders.length} đơn hàng đã chọn không?`
        );
        this.confirmAction.set('ORDER');
        this.isConfirmOpen.set(true);
    }

    closeConfirm(): void {
        if (this.isSubmitting()) {
            return;
        }

        this.isConfirmOpen.set(false);
        this.confirmAction.set(null);
    }

    submitConfirm(): void {
        const action = this.confirmAction();

        this.isConfirmOpen.set(false);

        if (action === 'PAYMENT') {
            this.bulkUpdatePaymentSelected({
                newStatus: 'PAID',
                changedNote: 'Đại lý xác nhận đã thanh toán'
            });
            return;
        }

        if (action === 'ORDER') {
            this.bulkUpdateSelected({
                newStatus: 'CONFIRMED',
                changedNote: 'Đại lý xác nhận đơn hàng'
            });
        }
    }

    private bulkUpdateSelected(request: UpdateOrderStatusRequest): void {
        const ids = this.selectedOrderIds();

        if (!ids.length) {
            return;
        }

        this.isSubmitting.set(true);

        let completed = 0;
        let failed = 0;

        ids.forEach(id => {
            this.orderService.updateStatus(id, request).subscribe({
                next: response => {
                    completed++;

                    if (!response.isSuccess) {
                        failed++;
                    }

                    this.finishBulkUpdate(completed, failed, ids.length);
                },
                error: () => {
                    completed++;
                    failed++;
                    this.finishBulkUpdate(completed, failed, ids.length);
                }
            });
        });
    }

    private bulkUpdatePaymentSelected(request: UpdatePaymentStatusRequest): void {
        const ids = this.selectedOrderIds();

        if (!ids.length) {
            return;
        }

        this.isSubmitting.set(true);

        let completed = 0;
        let failed = 0;

        ids.forEach(id => {
            this.orderService.updatePaymentStatus(id, request).subscribe({
                next: response => {
                    completed++;

                    if (!response.isSuccess) {
                        failed++;
                    }

                    this.finishBulkUpdate(completed, failed, ids.length);
                },
                error: () => {
                    completed++;
                    failed++;
                    this.finishBulkUpdate(completed, failed, ids.length);
                }
            });
        });
    }

    private finishBulkUpdate(completed: number, failed: number, total: number): void {
        if (completed < total) {
            return;
        }

        this.isSubmitting.set(false);
        this.selectedOrderIds.set([]);

        if (failed) {
            this.toastService.error(`Có ${failed} đơn cập nhật thất bại`);
        } else {
            this.toastService.success('Cập nhật đơn hàng thành công');
        }

        this.loadOrders();
    }

    private getSelectedOrders(): OrderResponse[] {
        const ids = this.selectedOrderIds();

        return this.orders().filter(order => ids.includes(order.id));
    }

    private isSelected(orderId: number): boolean {
        return this.selectedOrderIds().includes(orderId);
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.selectedOrderIds.set([]);
        this.loadOrders();
    }

    onFilterChange(value: OrderFilter): void {
        this.filter.set(value);
        this.selectedOrderIds.set([]);
    }

    onSortChange(key: string): void {
        if (this.sortBy() === key) {
            this.asc.set(!this.asc());
            return;
        }

        this.sortBy.set(key);
        this.asc.set(true);
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

    private formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }

    private formatDate(value: string): string {
        return new Date(value).toLocaleString('vi-VN');
    }
}