import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '../../../common/services/store.service';
import { ToastService } from '../../../common/services/toast.service';
import { StoreResponse } from '../../../common/models/store.model';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

@Component({
  selector: 'app-page-user-stores',
  imports: [],
  templateUrl: './user-stores.html'
})
export class PageUserStoresComponent {
  private readonly storeService = inject(StoreService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  stores = signal<StoreResponse[]>([]);
  loading = signal(false);

  page = signal(1);
  pageSize = signal(20);

  constructor() {
    this.loadStores();
  }

  loadStores(): void {
    this.loading.set(true);

    this.storeService.getAll(
      this.page(),
      this.pageSize()
    ).subscribe({
      next: response => {
        this.loading.set(false);
        this.stores.set(
          response.items.filter(store => store.isActive)
        );
      },
      error: () => {
        this.loading.set(false);
        this.toastService.error('Không tải được danh sách cửa hàng');
      }
    });
  }

  openStoreFoods(store: StoreResponse): void {
    this.router.navigate([
      '/',
      URL_ENDPOINT.USER,
      URL_ENDPOINT.USER_STORE_FOODS,
      store.refCode
    ]);
  }
}