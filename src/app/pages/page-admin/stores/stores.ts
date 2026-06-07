import { Component, inject, signal } from '@angular/core';
import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';
import { ToastService } from '../../../common/services/toast.service';
import { StoreService } from '../../../common/services/store.service';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import {
  TableColumn,
  TableRow
} from '../../../common/models/front-end/table/table-column.model';
import {
  StoreFilter,
  StoreResponse
} from '../../../common/models/store.model';
import {
  PopUpStoreAdd,
  StoreAddSubmit
} from './pop-up-store-add/pop-up-store-add';
import { PopUpStoreDetail, StoreDetailSubmit } from './pop-up-store-detail/pop-up-store-detail';

@Component({
  selector: 'app-page-admin-stores',
  imports: [
    AppTableComponent,
    FilterComponent,
    PopUpStoreAdd,
    PopUpStoreDetail
  ],
  templateUrl: './stores.html'
})
export class PageAdminStoresComponent {
  private readonly storeService = inject(StoreService);
  private readonly toastService = inject(ToastService);

  stores = signal<StoreResponse[]>([]);
  selectedStore = signal<StoreResponse | null>(null);

  page = signal(1);
  pageSize = signal(10);
  totalPages = signal(1);
  loading = signal(false);

  isAddOpen = signal(false);
  isDetailOpen = signal(false);
  isDetailRendered = signal(false);
  isSubmitting = signal(false);
  isDetailLoading = signal(false);
  sortBy = signal('');
  asc = signal(false);

  filter = signal<StoreFilter>({
    storeName: '',
    isActive: ''
  });

  columns: TableColumn[] = [
    {
      key: 'index',
      label: 'STT',
      width: '80px',
      align: 'center'
    },
    {
      key: 'thumbnailUrl',
      label: 'Ảnh',
      width: '90px',
      align: 'center',
      type: 'image'
    },
    {
      key: 'storeName',
      label: 'Tên cửa hàng',
      sortable: true,
      width: '150px',
    },
    {
      key: 'phoneNumber',
      label: 'Số điện thoại',
      width: '150px'
    },
    {
      key: 'address',
      label: 'Địa chỉ',
      width: '150px'
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      width: '150px',
      align: 'center',
      type: 'status'
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      width: '180px',
      align: 'center',
      sortable: true
    }
  ];

  filterFields: FilterField[] = [
    {
      key: 'storeName',
      label: 'Tên cửa hàng',
      type: 'text',
      placeholder: 'Nhập tên cửa hàng'
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      type: 'select',
      placeholder: 'Tất cả trạng thái',
      options: [
        {
          label: 'Hoạt động',
          value: true
        },
        {
          label: 'Ngừng hoạt động',
          value: false
        }
      ]
    }
  ];

  constructor() {
    this.loadStores();
  }

  rows(): TableRow[] {
    const filter = this.filter();

    let data = this.stores()
      .filter(store => {
        const matchName =
          !filter.storeName ||
          store.storeName
            .toLowerCase()
            .includes(filter.storeName.toLowerCase());

        const matchStatus =
          filter.isActive === '' ||
          store.isActive === filter.isActive;

        return matchName && matchStatus;
      });

    if (this.sortBy()) {
      data = [...data].sort((a, b) => {
        let aValue: string | number = '';
        let bValue: string | number = '';

        if (this.sortBy() === 'createdAt') {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        } else if (this.sortBy() === 'storeName') {
          aValue = a.storeName.toLowerCase();
          bValue = b.storeName.toLowerCase();
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

    return data.map((store, index) => ({
      index: (this.page() - 1) * this.pageSize() + index + 1,
      id: store.id,
      refCode: store.refCode,
      thumbnailUrl: store.thumbnailUrl,
      storeName: store.storeName,
      phoneNumber: store.phoneNumber ?? '',
      address: store.address ?? '',
      isActive: store.isActive,
      createdAt: this.formatDateTime(store.createdAt)
    }));
  }

  onSortChange(key: string): void {
    if (this.sortBy() === key) {
      this.asc.set(!this.asc());
      return;
    }

    this.sortBy.set(key);
    this.asc.set(true);
  }

  loadStores(): void {
    this.loading.set(true);

    this.storeService.getAll(
      this.page(),
      this.pageSize()
    ).subscribe({
      next: response => {
        this.stores.set(response.items);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Không tải được danh sách cửa hàng');
      }
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadStores();
  }

  onFilterChange(value: StoreFilter): void {
    this.filter.set(value);
  }

  openCreateModal(): void {
    this.isAddOpen.set(true);
  }

  closeCreateModal(): void {
    this.isAddOpen.set(false);
  }

  openDetail(row: TableRow): void {
    const id = Number(row['id']);

    this.isDetailLoading.set(true);

    this.storeService.getDetail(id).subscribe({
      next: response => {
        this.isDetailLoading.set(false);

        if (!response.isSuccess || !response.data) {
          this.toastService.error(response.message);
          return;
        }

        this.selectedStore.set(response.data);
        this.isDetailRendered.set(true);

        requestAnimationFrame(() => {
          this.isDetailOpen.set(true);
        });
      },
      error: () => {
        this.isDetailLoading.set(false);
        this.toastService.error('Không tải được chi tiết cửa hàng');
      }
    });
  }

  closeDetail(): void {
    this.isDetailOpen.set(false);

    setTimeout(() => {
      this.isDetailRendered.set(false);
      this.selectedStore.set(null);
    }, 300);
  }

  createStore(value: StoreAddSubmit): void {
    if (!value.storeName.trim()) {
      this.toastService.error('Vui lòng nhập tên cửa hàng');
      return;
    }

    this.isSubmitting.set(true);

    this.storeService.create(value).subscribe({
      next: response => {
        this.isSubmitting.set(false);

        if (!response.isSuccess) {
          this.toastService.error(response.message);
          return;
        }

        this.toastService.success(response.message);
        this.closeCreateModal();
        this.loadStores();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.error('Tạo cửa hàng thất bại');
      }
    });
  }

  updateStore(value: StoreDetailSubmit): void {
    const store = this.selectedStore();

    if (!store) {
      return;
    }

    if (!value.storeName.trim()) {
      this.toastService.error('Vui lòng nhập tên cửa hàng');
      return;
    }

    this.isSubmitting.set(true);

    this.storeService.update(store.id, value).subscribe({
      next: response => {
        this.isSubmitting.set(false);

        if (!response.isSuccess) {
          this.toastService.error(response.message);
          return;
        }

        this.toastService.success(response.message);
        this.closeDetail();
        this.loadStores();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.error('Cập nhật cửa hàng thất bại');
      }
    });
  }

  deleteStore(id: number): void {
    this.isSubmitting.set(true);

    this.storeService.delete(id).subscribe({
      next: response => {
        this.isSubmitting.set(false);

        if (!response.isSuccess) {
          this.toastService.error(response.message);
          return;
        }

        this.toastService.success(response.message);
        this.closeDetail();
        this.loadStores();
      },
      error: () => {
        this.isSubmitting.set(false);
        this.toastService.error('Xoá cửa hàng thất bại');
      }
    });
  }

  private formatDateTime(value: string): string {
    const date = new Date(value);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hour}:${minute}`;
  }
}