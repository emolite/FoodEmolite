import { Component, inject, signal } from '@angular/core';
import { CustomerService } from '../../../common/services/customer.service';
import { StoreService } from '../../../common/services/store.service';
import { ToastService } from '../../../common/services/toast.service';
import { CustomerListItem } from '../../../common/models/customer.model';
import { BaseSearchRequest } from '../../../common/models/base-search.model';

import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';
import { DropdownComponent, DropdownOption } from '../../../shared/component/dropdown/dropdown';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import {
    TableColumn,
    TableRow
} from '../../../common/models/front-end/table/table-column.model';

interface CustomerFilter {
    keyword: string;
}

@Component({
    selector: 'app-admin-customers',
    imports: [
        AppTableComponent,
        FilterComponent,
        DropdownComponent
    ],
    templateUrl: './customers.html'
})
export class CustomersComponent {
    private readonly customerService = inject(CustomerService);
    private readonly storeService = inject(StoreService);
    private readonly toastService = inject(ToastService);

    customers = signal<CustomerListItem[]>([]);
    loading = signal(false);

    page = signal(1);
    pageSize = signal(10);
    totalPages = signal(1);
    totalRecords = signal(0);

    sortBy = signal('');
    asc = signal(false);

    filter = signal<CustomerFilter>({ keyword: '' });

    selectedStoreRefCode = signal<string | null>(null);

    storeOptions = signal<DropdownOption[]>([
        { label: 'Toàn bộ cửa hàng', value: '' }
    ]);

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Tìm kiếm',
            type: 'text',
            placeholder: 'Tên, SĐT hoặc email'
        }
    ];

    columns: TableColumn[] = [
        {
            key: 'index',
            label: 'STT',
            width: '60px',
            align: 'center'
        },
        {
            key: 'avatarUrl',
            label: 'Ảnh',
            width: '70px',
            align: 'center',
            type: 'image'
        },
        {
            key: 'customerName',
            label: 'Tên khách hàng',
            sortable: true
        },
        {
            key: 'typeText',
            label: 'Loại',
            width: '120px',
            align: 'center',
            type: 'badge'
        },
        {
            key: 'storeName',
            label: 'Cửa hàng',
            width: '180px'
        },
        {
            key: 'phoneNumber',
            label: 'Số điện thoại',
            width: '150px'
        },
        {
            key: 'email',
            label: 'Email',
            width: '200px'
        },
        {
            key: 'totalOrders',
            label: 'Tổng đơn',
            width: '110px',
            align: 'center',
            sortable: true
        },
        {
            key: 'totalSpent',
            label: 'Tổng chi tiêu',
            width: '160px',
            align: 'right',
            sortable: true
        },
        {
            key: 'lastOrderAt',
            label: 'Mua gần nhất',
            width: '180px',
            type: 'date',
            sortable: true
        }
    ];

    constructor() {
        this.loadStoreOptions();
        this.loadCustomers();
    }

    rows(): TableRow[] {
        return this.customers().map((customer, index) => ({
            index: (this.page() - 1) * this.pageSize() + index + 1,
            avatarUrl: customer.avatarUrl,
            customerName: customer.customerName,
            typeText: {
                text: customer.isGuest ? 'Vãng lai' : 'Thành viên',
                value: customer.isGuest ? 'GUEST' : 'MEMBER'
            },
            storeName: customer.storeName,
            phoneNumber: customer.phoneNumber ?? '—',
            email: customer.email ?? '—',
            totalOrders: customer.totalOrders,
            totalSpent: this.formatCurrency(customer.totalSpent),
            lastOrderAt: customer.lastOrderAt
        }));
    }

    loadStoreOptions(): void {
        this.storeService.getAll(1, 200).subscribe({
            next: response => {
                this.storeOptions.set([
                    { label: 'Toàn bộ cửa hàng', value: '' },
                    ...(response.items ?? []).map(store => ({
                        label: store.storeName,
                        value: store.refCode
                    }))
                ]);
            }
        });
    }

    onStoreChange(option: DropdownOption | null): void {
        const value = option?.value ? String(option.value) : null;
        this.selectedStoreRefCode.set(value || null);
        this.page.set(1);
        this.loadCustomers();
    }

    loadCustomers(): void {
        this.loading.set(true);

        const request: BaseSearchRequest<{ keyword: string | null; storeRefCode: string | null }> = {
            page: this.page(),
            pageSize: this.pageSize(),
            sortBy: this.sortBy() || null,
            asc: this.asc(),
            searchParams: {
                keyword: this.filter().keyword || null,
                storeRefCode: this.selectedStoreRefCode()
            }
        };

        this.customerService.searchAdminCustomers(request).subscribe({
            next: response => {
                this.loading.set(false);
                this.customers.set(response.items ?? []);
                this.totalPages.set(response.totalPages);
                this.totalRecords.set(response.totalRecords);
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được danh sách khách hàng');
            }
        });
    }

    onFilterChange(value: CustomerFilter): void {
        this.filter.set(value);
        this.page.set(1);
        this.loadCustomers();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadCustomers();
    }

    onSortChange(key: string): void {
        if (this.sortBy() === key) {
            this.asc.set(!this.asc());
        } else {
            this.sortBy.set(key);
            this.asc.set(true);
        }

        this.page.set(1);
        this.loadCustomers();
    }

    private formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }
}
