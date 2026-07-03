import { Component, inject, signal } from '@angular/core';
import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';
import { ToastService } from '../../../common/services/toast.service';
import { StoreFoodService } from '../../../common/services/store-food.service';
import { ProfileService } from '../../../common/services/profile.service';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import {
    TableColumn,
    TableRow
} from '../../../common/models/front-end/table/table-column.model';
import {
    CreateStoreFoodRequest,
    StoreFoodResponse,
    UpdateStoreFoodRequest
} from '../../../common/models/store-food.model';
import { PopUpAgentFoodAddComponent } from './pop-up-agent-food-add/pop-up-agent-food-add';
import { PopUpAgentFoodDetailComponent } from './pop-up-agent-food-detail/pop-up-agent-food-detail';
import { StoreFoodCategoryService } from '../../../common/services/store-food-category.service';

interface StoreFoodFilter {
    foodName: string;
    isAvailable: boolean | '';
}

interface StoreFoodFilter {
    foodName: string;
    isAvailable: boolean | '';
    categoryId: number | '';
}

@Component({
    selector: 'app-page-agent-foods',
    imports: [
        AppTableComponent,
        FilterComponent,
        PopUpAgentFoodAddComponent,
        PopUpAgentFoodDetailComponent
    ],
    templateUrl: './agent-foods.html'
})
export class PageAgentFoodsComponent {
    private readonly storeFoodService = inject(StoreFoodService);
    private readonly profileService = inject(ProfileService);
    private readonly toastService = inject(ToastService);
    private readonly categoryService = inject(StoreFoodCategoryService);

    storeFoods = signal<StoreFoodResponse[]>([]);
    selectedFood = signal<StoreFoodResponse | null>(null);
    storeRefCode = signal<string | null>(null);

    page = signal(1);
    pageSize = signal(10);
    totalPages = signal(1);
    loading = signal(false);
    isSubmitting = signal(false);
    isDetailLoading = signal(false);

    isAddOpen = signal(false);
    isDetailOpen = signal(false);
    isDetailRendered = signal(false);

    sortBy = signal('');
    asc = signal(false);

    filter = signal<StoreFoodFilter>({
        foodName: '',
        isAvailable: '',
        categoryId: ''
    });

    categoryOptions: {
        label: string;
        value: number | '';
    }[] = [];
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
            key: 'foodName',
            label: 'Tên món',
            width: '180px',
            sortable: true
        },
        {
            key: 'price',
            label: 'Giá',
            width: '130px',
            align: 'right',
            sortable: true
        },
        {
            key: 'quantity',
            label: 'Số lượng',
            width: '120px',
            align: 'center',
            sortable: true
        },
        {
            key: 'description',
            label: 'Mô tả',
            width: '220px'
        },
        {
            key: 'isAvailable',
            label: 'Trạng thái',
            width: '150px',
            align: 'center',
            type: 'status',
            trueText: 'Đang bán',
            falseText: 'Ngừng bán'
        }
    ];

    filterFields: FilterField[] = [];
    private updateFilterFields(): void {
        this.filterFields = [
            {
                key: 'foodName',
                label: 'Tên món',
                type: 'text',
                placeholder: 'Nhập tên món'
            },
            {
                key: 'categoryId',
                label: 'Danh mục',
                type: 'select',
                placeholder: 'Tất cả danh mục',
                options: this.categoryOptions
            },
            {
                key: 'isAvailable',
                label: 'Trạng thái',
                type: 'select',
                placeholder: 'Tất cả trạng thái',
                options: [
                    {
                        label: 'Đang bán',
                        value: true
                    },
                    {
                        label: 'Ngừng bán',
                        value: false
                    }
                ]
            }
        ];
    }
    constructor() {
        this.loadMyStore();
    }

    rows(): TableRow[] {
        const filter = this.filter();

        let data = this.storeFoods().filter(food => {
            const matchName =
                !filter.foodName ||
                food.foodName
                    .toLowerCase()
                    .includes(filter.foodName.toLowerCase());

            const matchStatus =
                filter.isAvailable === '' ||
                food.isAvailable === filter.isAvailable;

            return matchName && matchStatus;
        });

        if (this.sortBy()) {
            data = [...data].sort((a, b) => {
                let aValue: string | number = '';
                let bValue: string | number = '';

                if (this.sortBy() === 'foodName') {
                    aValue = a.foodName.toLowerCase();
                    bValue = b.foodName.toLowerCase();
                }

                if (this.sortBy() === 'price') {
                    aValue = a.price;
                    bValue = b.price;
                }

                if (this.sortBy() === 'quantity') {
                    aValue = a.quantity;
                    bValue = b.quantity;
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

        return data.map((food, index) => ({
            index: (this.page() - 1) * this.pageSize() + index + 1,
            id: food.id,
            refCode: food.refCode,
            storeRefCode: food.storeRefCode,
            thumbnailUrl: food.thumbnailUrl,
            foodName: food.foodName,
            price: this.formatCurrency(food.price),
            quantity: food.quantity,
            description: food.description ?? '',
            isAvailable: food.isAvailable
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
                this.loadCategories();
                this.loadStoreFoods();
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được thông tin đại lý');
            }
        });
    }

    loadCategories(): void {
        const refCode =
            this.storeRefCode();

        if (!refCode) {
            return;
        }

        this.categoryService
            .getByStoreRefCode(refCode)
            .subscribe({
                next: response => {
                    if (
                        response.isSuccess &&
                        response.data
                    ) {
                        this.categoryOptions = [
                            {
                                label: 'Tất cả danh mục',
                                value: ''
                            },

                            ...response.data.map(x => ({
                                label: x.categoryName,
                                value: x.id
                            }))
                        ];

                        this.updateFilterFields();
                    }
                }
            });
    }

    loadStoreFoods(): void {
        const refCode = this.storeRefCode();

        if (!refCode) {
            this.loading.set(false);
            return;
        }

        this.loading.set(true);

        this.storeFoodService.getByStoreRefCode(
            refCode,
            this.filter().categoryId || null,
            this.page(),
            this.pageSize(),
        ).subscribe({
            next: response => {
                this.storeFoods.set(response.items);
                this.totalPages.set(response.totalPages);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được danh sách món ăn');
            }
        });
    }

    openCreateModal(): void {
        this.isAddOpen.set(true);
    }

    closeCreateModal(): void {
        this.isAddOpen.set(false);
    }

    createFood(request: CreateStoreFoodRequest): void {
        this.isSubmitting.set(true);

        this.storeFoodService.create(request).subscribe({
            next: response => {
                this.isSubmitting.set(false);

                if (!response.isSuccess) {
                    this.toastService.error(response.message);
                    return;
                }

                this.toastService.success(response.message);
                this.closeCreateModal();
                this.loadStoreFoods();
            },
            error: () => {
                this.isSubmitting.set(false);
                this.toastService.error('Thêm món ăn thất bại');
            }
        });
    }

    openDetail(row: TableRow): void {
        const id = Number(row['id']);

        this.isDetailLoading.set(true);

        this.storeFoodService.getDetail(id).subscribe({
            next: response => {
                this.isDetailLoading.set(false);

                if (!response.isSuccess || !response.data) {
                    this.toastService.error(response.message);
                    return;
                }

                this.selectedFood.set(response.data);
                this.isDetailRendered.set(true);
                this.isDetailOpen.set(true);
            },
            error: () => {
                this.isDetailLoading.set(false);
                this.toastService.error('Không lấy được chi tiết món ăn');
            }
        });
    }

    closeDetail(): void {
        this.isDetailOpen.set(false);

        setTimeout(() => {
            this.isDetailRendered.set(false);
            this.selectedFood.set(null);
        }, 200);
    }

    updateFood(request: UpdateStoreFoodRequest): void {
        const food = this.selectedFood();

        if (!food) return;

        this.isSubmitting.set(true);

        this.storeFoodService.update(food.id, request).subscribe({
            next: response => {
                this.isSubmitting.set(false);

                if (!response.isSuccess) {
                    this.toastService.error(response.message);
                    return;
                }

                this.toastService.success(response.message);
                this.closeDetail();
                this.loadStoreFoods();
            },
            error: () => {
                this.isSubmitting.set(false);
                this.toastService.error('Cập nhật món ăn thất bại');
            }
        });
    }

    deleteFood(id: number): void {
        this.isSubmitting.set(true);

        this.storeFoodService.delete(id).subscribe({
            next: response => {
                this.isSubmitting.set(false);

                if (!response.isSuccess) {
                    this.toastService.error(response.message);
                    return;
                }

                this.toastService.success(response.message);
                this.closeDetail();
                this.loadStoreFoods();
            },
            error: () => {
                this.isSubmitting.set(false);
                this.toastService.error('Xóa món ăn thất bại');
            }
        });
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadStoreFoods();
    }

    onFilterChange(value: StoreFoodFilter): void {
        this.filter.set(value);
    }

    onSortChange(key: string): void {
        if (this.sortBy() === key) {
            this.asc.set(!this.asc());
            return;
        }

        this.sortBy.set(key);
        this.asc.set(true);
    }

    private formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }
}