import {
    Component,
    inject,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexFill,
    ApexLegend,
    ApexNonAxisChartSeries,
    ApexPlotOptions,
    ApexResponsive,
    ApexStroke,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from 'ng-apexcharts';

import { RevenueService } from '../../../common/services/revenue.service';
import {
    AgentRevenueResponse,
    RevenueGroupBy
} from '../../../common/models/revenue.model';

import { DropdownComponent, DropdownOption } from '../../../shared/component/dropdown/dropdown';

export type LineChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    yaxis: ApexYAxis;
    stroke: ApexStroke;
    dataLabels: ApexDataLabels;
    tooltip: ApexTooltip;
    fill: ApexFill;
};

export type DonutChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    legend: ApexLegend;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    responsive: ApexResponsive[];
};

@Component({
    selector: 'app-agent-revenue',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgApexchartsModule,
        DropdownComponent
    ],
    templateUrl: './agent-revenue.html'
})
export class AgentRevenueComponent {
    private readonly revenueService = inject(RevenueService);

    readonly loading = signal(false);

    readonly fromDate = signal('');
    readonly toDate = signal('');
    readonly groupBy = signal<RevenueGroupBy>('day');

    readonly data = signal<AgentRevenueResponse | null>(null);

    readonly groupByOptions: DropdownOption[] = [
        {
            label: 'Theo ngày',
            value: 'day'
        },
        {
            label: 'Theo tháng',
            value: 'month'
        }
    ];

    readonly totalOrders = signal(0);
    readonly totalRevenue = signal(0);

    lineChartOptions: Partial<LineChartOptions> = this.getDefaultLineChartOptions();
    donutChartOptions: Partial<DonutChartOptions> = this.getDefaultDonutChartOptions();

    ngOnInit(): void {
        this.loadRevenue();
    }

    loadRevenue(): void {
        this.loading.set(true);

        this.revenueService
            .getAgentRevenue({
                fromDate: this.fromDate() || null,
                toDate: this.toDate() || null,
                groupBy: this.groupBy()
            })
            .subscribe({
                next: (res) => {
                    if (!res.isSuccess || !res.data) {
                        this.data.set(null);
                        this.totalOrders.set(0);
                        this.totalRevenue.set(0);
                        this.updateCharts(null);
                        return;
                    }

                    this.data.set(res.data);
                    this.totalOrders.set(res.data.totalOrders);
                    this.totalRevenue.set(res.data.totalRevenue);
                    this.updateCharts(res.data);
                },
                complete: () => {
                    this.loading.set(false);
                },
                error: () => {
                    this.loading.set(false);
                }
            });
    }

    resetFilter(): void {
        this.fromDate.set('');
        this.toDate.set('');
        this.groupBy.set('day');
        this.loadRevenue();
    }

    onGroupByChange(value: unknown): void {
        this.groupBy.set(value as RevenueGroupBy);
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    }

    private updateCharts(data: AgentRevenueResponse | null): void {
        const lineItems = data?.lineChart ?? [];
        const pieItems = data?.pieChart ?? [];

        this.lineChartOptions = {
            ...this.getDefaultLineChartOptions(),
            series: [
                {
                    name: 'Doanh thu',
                    data: lineItems.map(x => x.revenue)
                },
                {
                    name: 'Số đơn',
                    data: lineItems.map(x => x.orderCount)
                }
            ],
            xaxis: {
                categories: lineItems.map(x => x.label),
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            }
        };

        this.donutChartOptions = {
            ...this.getDefaultDonutChartOptions(),
            series: pieItems.map(x => x.value),
            labels: pieItems.map(x => this.getStatusLabel(x.label))
        };
    }

    private getDefaultLineChartOptions(): Partial<LineChartOptions> {
        return {
            series: [
                {
                    name: 'Doanh thu',
                    data: []
                },
                {
                    name: 'Số đơn',
                    data: []
                }
            ],
            chart: {
                type: 'line',
                height: 330,
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                },
                fontFamily: 'inherit'
            },
            stroke: {
                curve: 'smooth',
                width: [3, 2]
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                opacity: 1
            },
            xaxis: {
                categories: [],
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: (value: number) =>
                        value >= 1000000
                            ? `${Math.round(value / 1000000)}tr`
                            : `${Math.round(value)}`,
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            tooltip: {
                y: {
                    formatter: (value: number, opts) => {
                        const seriesName =
                            opts.w.globals.seriesNames[opts.seriesIndex];

                        if (seriesName === 'Doanh thu') {
                            return this.formatCurrency(value);
                        }

                        return `${Math.round(value)} đơn`;
                    }
                }
            }
        };
    }

    private getDefaultDonutChartOptions(): Partial<DonutChartOptions> {
        return {
            series: [],
            labels: [],
            chart: {
                type: 'donut',
                height: 330,
                fontFamily: 'inherit'
            },
            legend: {
                position: 'bottom',
                fontSize: '13px',
                labels: {
                    colors: '#374151'
                }
            },
            dataLabels: {
                enabled: true,
                formatter: (value: number) => `${value.toFixed(0)}%`
            },
            tooltip: {
                y: {
                    formatter: (value: number) => this.formatCurrency(value)
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '68%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Tổng',
                                formatter: () => this.formatCurrency(this.totalRevenue())
                            }
                        }
                    }
                }
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        chart: {
                            height: 280
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ]
        };
    }

    private readonly orderStatusMap: Record<string, string> = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận'
    };

    private readonly paymentStatusMap: Record<string, string> = {
        UNPAID: 'Chưa thanh toán',
        PAID: 'Đã thanh toán'
    };

    private getStatusLabel(value: string): string {
        return this.orderStatusMap[value] ??
            this.paymentStatusMap[value] ??
            value;
    }
}