import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexGrid,
    ApexPlotOptions,
    ApexTheme,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from 'ng-apexcharts';

import { RevenueService } from '../../../common/services/revenue.service';
import { StoreService } from '../../../common/services/store.service';
import { ToastService } from '../../../common/services/toast.service';
import { TopSellingProduct } from '../../../common/models/revenue.model';
import { BaseSearchRequest } from '../../../common/models/base-search.model';

import { AppTableComponent } from '../../../shared/component/table/table';
import { FilterComponent } from '../../../shared/component/filter/filter';
import { DatePickerComponent } from '../../../shared/component/date-picker/date-picker';
import { DropdownComponent, DropdownOption } from '../../../shared/component/dropdown/dropdown';
import { FilterField } from '../../../common/models/front-end/filter/filter-field.model';
import {
    TableColumn,
    TableRow
} from '../../../common/models/front-end/table/table-column.model';

export type BarChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    theme: ApexTheme;
    colors: string[];
    grid: ApexGrid;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    tooltip: ApexTooltip;
};

interface ProductFilter {
    keyword: string;
}

@Component({
    selector: 'app-admin-product-revenue',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgApexchartsModule,
        DatePickerComponent,
        DropdownComponent,
        AppTableComponent,
        FilterComponent
    ],
    templateUrl: './product-revenue.html'
})
export class ProductRevenueComponent {
    private readonly revenueService = inject(RevenueService);
    private readonly storeService = inject(StoreService);
    private readonly toastService = inject(ToastService);

    readonly loadingChart = signal(false);
    readonly loadingTable = signal(false);

    readonly fromDate = signal('');
    readonly toDate = signal('');
    readonly selectedStoreRefCode = signal<string | null>(null);

    readonly storeOptions = signal<DropdownOption[]>([
        { label: 'Toàn bộ cửa hàng', value: '' }
    ]);

    readonly topProducts = signal<TopSellingProduct[]>([]);
    readonly products = signal<TopSellingProduct[]>([]);

    page = signal(1);
    pageSize = signal(10);
    totalPages = signal(1);

    filter = signal<ProductFilter>({ keyword: '' });

    filterFields: FilterField[] = [
        {
            key: 'keyword',
            label: 'Tìm kiếm',
            type: 'text',
            placeholder: 'Tên món'
        }
    ];

    productColumns: TableColumn[] = [
        {
            key: 'index',
            label: 'STT',
            width: '60px',
            align: 'center'
        },
        {
            key: 'thumbnailUrl',
            label: 'Ảnh',
            width: '70px',
            align: 'center',
            type: 'image'
        },
        {
            key: 'foodName',
            label: 'Tên sản phẩm'
        },
        {
            key: 'storeName',
            label: 'Cửa hàng'
        },
        {
            key: 'quantitySold',
            label: 'Số lượng bán',
            width: '160px',
            align: 'center',
            sortable: true
        },
        {
            key: 'revenue',
            label: 'Doanh thu',
            width: '180px',
            align: 'right',
            sortable: true
        }
    ];

    barChartOptions: Partial<BarChartOptions> = this.getDefaultBarChartOptions();

    constructor() {
        this.loadStoreOptions();
        this.loadTopProducts();
        this.loadProductTable();
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
    }

    loadTopProducts(): void {
        this.loadingChart.set(true);

        this.revenueService
            .getAdminTopProducts(
                {
                    fromDate: this.fromDate() || null,
                    toDate: this.toDate() || null
                },
                this.selectedStoreRefCode(),
                10
            )
            .subscribe({
                next: response => {
                    this.loadingChart.set(false);

                    if (!response.isSuccess || !response.data) {
                        this.topProducts.set([]);
                        this.updateBarChart([]);
                        return;
                    }

                    this.topProducts.set(response.data);
                    this.updateBarChart(response.data);
                },
                error: () => {
                    this.loadingChart.set(false);
                    this.toastService.error('Không tải được top sản phẩm bán chạy');
                }
            });
    }

    loadProductTable(): void {
        this.loadingTable.set(true);

        const request: BaseSearchRequest<{
            fromDate: string | null;
            toDate: string | null;
            keyword: string | null;
            storeRefCode: string | null;
        }> = {
            page: this.page(),
            pageSize: this.pageSize(),
            sortBy: 'revenue',
            asc: false,
            searchParams: {
                fromDate: this.fromDate() || null,
                toDate: this.toDate() || null,
                keyword: this.filter().keyword || null,
                storeRefCode: this.selectedStoreRefCode()
            }
        };

        this.revenueService.searchAdminProductRevenue(request).subscribe({
            next: response => {
                this.loadingTable.set(false);
                this.products.set(response.items ?? []);
                this.totalPages.set(response.totalPages);
            },
            error: () => {
                this.loadingTable.set(false);
                this.toastService.error('Không tải được doanh thu theo sản phẩm');
            }
        });
    }

    productRows(): TableRow[] {
        return this.products().map((product, index) => ({
            index: (this.page() - 1) * this.pageSize() + index + 1,
            thumbnailUrl: product.thumbnailUrl,
            foodName: product.foodName,
            storeName: product.storeName,
            quantitySold: product.quantitySold,
            revenue: this.formatCurrency(product.revenue)
        }));
    }

    applyFilter(): void {
        this.loadTopProducts();
        this.page.set(1);
        this.loadProductTable();
    }

    resetFilter(): void {
        this.fromDate.set('');
        this.toDate.set('');
        this.selectedStoreRefCode.set(null);
        this.filter.set({ keyword: '' });
        this.applyFilter();
    }

    onFilterChange(value: ProductFilter): void {
        this.filter.set(value);
        this.page.set(1);
        this.loadProductTable();
    }

    onPageChange(page: number): void {
        this.page.set(page);
        this.loadProductTable();
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    }

    private updateBarChart(items: TopSellingProduct[]): void {
        const sorted = [...items].reverse();

        this.barChartOptions = {
            ...this.getDefaultBarChartOptions(),
            series: [
                {
                    name: 'Số lượng bán',
                    data: sorted.map(x => x.quantitySold)
                }
            ],
            xaxis: {
                categories: sorted.map(x => this.selectedStoreRefCode() ? x.foodName : `${x.foodName} (${x.storeName})`),
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '12px'
                    }
                }
            }
        };
    }

    private getDefaultBarChartOptions(): Partial<BarChartOptions> {
        return {
            series: [{ name: 'Số lượng bán', data: [] }],
            chart: {
                type: 'bar',
                height: 380,
                toolbar: { show: false },
                fontFamily: 'inherit',
                foreColor: '#9ca3af'
            },
            theme: {
                mode: 'dark'
            },
            colors: ['#a78bfa'],
            grid: {
                borderColor: 'rgba(255,255,255,0.06)'
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4,
                    barHeight: '55%'
                }
            },
            dataLabels: {
                enabled: false
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#9ca3af',
                        fontSize: '12px'
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: (value: number) => `${value} đã bán`
                }
            }
        };
    }
}
