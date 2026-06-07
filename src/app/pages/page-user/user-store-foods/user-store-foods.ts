import {
    Component,
    HostListener,
    computed,
    inject,
    signal
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreFoodService } from '../../../common/services/store-food.service';
import { ToastService } from '../../../common/services/toast.service';
import { StoreFoodResponse } from '../../../common/models/store-food.model';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

interface CartItem {
    food: StoreFoodResponse;
    quantity: number;
    note: string;
}

@Component({
    selector: 'app-page-user-store-foods',
    imports: [],
    templateUrl: './user-store-foods.html'
})
export class PageUserStoreFoodsComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeFoodService = inject(StoreFoodService);
    private readonly toastService = inject(ToastService);

    storeRefCode = signal('');
    foods = signal<StoreFoodResponse[]>([]);
    cart = signal<CartItem[]>([]);

    loading = signal(false);
    isMobileCartOpen = signal(false);

    cartWidth = signal(380);
    isResizing = signal(false);

    totalQuantity = computed(() =>
        this.cart().reduce(
            (total, item) => total + item.quantity,
            0
        )
    );

    totalAmount = computed(() =>
        this.cart().reduce(
            (total, item) => total + item.food.price * item.quantity,
            0
        )
    );

    constructor() {
        const storeRefCode =
            this.route.snapshot.paramMap.get('storeRefCode') ?? '';

        this.storeRefCode.set(storeRefCode);
        this.loadFoods();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing()) {
            return;
        }

        const width = window.innerWidth - event.clientX;
        const min = 320;
        const max = 560;

        this.cartWidth.set(
            Math.min(Math.max(width, min), max)
        );
    }

    @HostListener('document:mouseup')
    onMouseUp(): void {
        this.isResizing.set(false);
    }

    startResize(event: MouseEvent): void {
        event.preventDefault();
        this.isResizing.set(true);
    }

    loadFoods(): void {
        this.loading.set(true);

        this.storeFoodService.getByStoreRefCode(
            this.storeRefCode(),
            1,
            100
        ).subscribe({
            next: response => {
                this.loading.set(false);
                this.foods.set(
                    response.items.filter(food => food.isAvailable)
                );
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được danh sách món ăn');
            }
        });
    }

    addToCart(food: StoreFoodResponse): void {
        const existed = this.cart().find(item =>
            item.food.id === food.id
        );

        if (existed) {
            this.increase(food.id);
            return;
        }

        this.cart.update(items => [
            ...items,
            {
                food,
                quantity: 1,
                note: ''
            }
        ]);
    }

    increase(foodId: number): void {
        this.cart.update(items =>
            items.map(item =>
                item.food.id === foodId
                    ? {
                        ...item,
                        quantity: item.quantity + 1
                    }
                    : item
            )
        );
    }

    decrease(foodId: number): void {
        this.cart.update(items =>
            items
                .map(item =>
                    item.food.id === foodId
                        ? {
                            ...item,
                            quantity: item.quantity - 1
                        }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    }

    setQuantity(foodId: number, quantity: number): void {
        const nextQuantity = !quantity || quantity < 1
            ? 1
            : Math.floor(quantity);

        this.cart.update(items =>
            items.map(item =>
                item.food.id === foodId
                    ? {
                        ...item,
                        quantity: nextQuantity
                    }
                    : item
            )
        );
    }

    remove(foodId: number): void {
        this.cart.update(items =>
            items.filter(item => item.food.id !== foodId)
        );
    }

    updateNote(foodId: number, note: string): void {
        this.cart.update(items =>
            items.map(item =>
                item.food.id === foodId
                    ? {
                        ...item,
                        note
                    }
                    : item
            )
        );
    }

    openMobileCart(): void {
        this.isMobileCartOpen.set(true);
    }

    onQuantityInput(foodId: number, value: string): void {
        const quantity = Number(value.replace(/\D/g, ''));

        this.setQuantity(foodId, quantity);
    }

    closeMobileCart(): void {
        this.isMobileCartOpen.set(false);
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
}