import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

@Component({
    selector: 'app-page-order-success',
    imports: [],
    templateUrl: './order-success.html'
})
export class PageOrderSuccessComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    orderCode = signal('');
    totalAmount = signal(0);

    hasOrderCode = computed(() => !!this.orderCode());

    constructor() {
        const params = this.route.snapshot.queryParamMap;

        this.orderCode.set(params.get('orderCode') ?? '');
        this.totalAmount.set(Number(params.get('amount') ?? 0));
    }

    formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }

    backToStores(): void {
        this.router.navigate([
            '/',
            URL_ENDPOINT.USER,
            URL_ENDPOINT.USER_STORES
        ]);
    }

    viewHistory(): void {
        this.router.navigate([
            '/',
            URL_ENDPOINT.USER,
            URL_ENDPOINT.USER_HISTORY
        ]);
    }
}