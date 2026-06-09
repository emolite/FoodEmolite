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
import { OrderService } from '../../../common/services/order.service';
import { StoreFoodResponse } from '../../../common/models/store-food.model';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';
import { PopUpUserFoodOptionsComponent } from './pop-up-user-food-options/pop-up-user-food-options';

export interface CartItemOption {
    optionGroupId: number;
    optionGroupName: string;
    optionId: number;
    optionName: string;
    additionalPrice: number;
}

interface CartItem {
    food: StoreFoodResponse;
    quantity: number;
    note: string;
    selectedOptions: CartItemOption[];
    isDetailLoaded: boolean;
}

@Component({
    selector: 'app-page-user-store-foods',
    imports: [
        PopUpUserFoodOptionsComponent
    ],
    templateUrl: './user-store-foods.html'
})
export class PageUserStoreFoodsComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeFoodService = inject(StoreFoodService);
    private readonly toastService = inject(ToastService);
    private readonly orderService = inject(OrderService);

    storeRefCode = signal('');
    foods = signal<StoreFoodResponse[]>([]);
    cart = signal<CartItem[]>([]);

    loading = signal(false);
    ordering = signal(false);
    isMobileCartOpen = signal(false);

    isConfirmOrderOpen = signal(false);
    isOptionPopupOpen = signal(false);
    selectingCartIndex = signal<number | null>(null);

    cartWidth = signal(380);
    isResizing = signal(false);

    totalQuantity = computed(() =>
        this.cart().reduce(
            (total, item) => total + item.quantity,
            0
        )
    );

    totalAmount = computed(() =>
        this.cart().reduce((total, item) => {
            const optionAmount = item.selectedOptions.reduce(
                (sum, option) => sum + option.additionalPrice,
                0
            );

            return total + (item.food.price + optionAmount) * item.quantity;
        }, 0)
    );

    constructor() {
        const storeRefCode =
            this.route.snapshot.paramMap.get('storeRefCode') ?? '';

        this.storeRefCode.set(storeRefCode);
        this.loadFoods();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (!this.isResizing()) return;

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
            item.food.id === food.id &&
            item.selectedOptions.length === 0
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
                note: '',
                selectedOptions: [],
                isDetailLoaded: false
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

    openConfirmOrder(): void {
        if (this.cart().length === 0 || this.ordering()) return;

        this.isConfirmOrderOpen.set(true);
    }

    closeConfirmOrder(): void {
        this.isConfirmOrderOpen.set(false);
    }

    confirmOrder(): void {
        this.isConfirmOrderOpen.set(false);
        this.ensureCartItemsHaveOptions();
    }

    private ensureCartItemsHaveOptions(): void {
        const itemNeedLoad = this.cart().find(item =>
            !item.isDetailLoaded
        );

        if (!itemNeedLoad) {
            this.checkOptionsBeforeCreateOrder();
            return;
        }

        this.storeFoodService.getDetail(itemNeedLoad.food.id).subscribe({
            next: response => {
                if (!response.isSuccess || !response.data) {
                    this.toastService.error(response.message || 'Không tải được tùy chọn món');
                    return;
                }

                const foodDetail: StoreFoodResponse = response.data;

                this.cart.update(items =>
                    items.map(item =>
                        item.food.id === itemNeedLoad.food.id
                            ? {
                                ...item,
                                food: foodDetail,
                                isDetailLoaded: true
                            }
                            : item
                    )
                );

                this.ensureCartItemsHaveOptions();
            },
            error: () => {
                this.toastService.error('Không tải được tùy chọn món');
            }
        });
    }

    private checkOptionsBeforeCreateOrder(): void {
        const indexNeedOption = this.cart().findIndex(item =>
            this.isCartItemMissingRequiredOption(item)
        );

        if (indexNeedOption >= 0) {
            this.selectingCartIndex.set(indexNeedOption);
            this.isOptionPopupOpen.set(true);
            return;
        }

        this.createOrder();
    }

    private isCartItemMissingRequiredOption(item: CartItem): boolean {
        const requiredGroups = (item.food.optionGroups ?? []).filter(group =>
            group.isRequired
        );

        if (requiredGroups.length === 0) return false;

        return requiredGroups.some(group =>
            !item.selectedOptions.some(option =>
                option.optionGroupId === group.id
            )
        );
    }

    applyOptions(options: CartItemOption[]): void {
        const index = this.selectingCartIndex();

        if (index === null) return;

        this.cart.update(items =>
            items.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        selectedOptions: options
                    }
                    : item
            )
        );

        this.isOptionPopupOpen.set(false);
        this.selectingCartIndex.set(null);

        this.checkOptionsBeforeCreateOrder();
    }

    closeOptionPopup(): void {
        this.isOptionPopupOpen.set(false);
        this.selectingCartIndex.set(null);
    }

    createOrder(): void {
        if (this.cart().length === 0 || this.ordering()) {
            return;
        }

        this.ordering.set(true);

        this.orderService.create({
            storeRefCode: this.storeRefCode(),
            note: null,
            items: this.cart().map(item => ({
                storeFoodId: item.food.id,
                quantity: item.quantity,
                options: item.selectedOptions.map(option => ({
                    optionGroupId: option.optionGroupId,
                    optionGroupName: option.optionGroupName,
                    optionId: option.optionId,
                    optionName: option.optionName,
                    additionalPrice: option.additionalPrice
                }))
            }))
        }).subscribe({
            next: response => {
                this.ordering.set(false);

                if (!response.isSuccess) {
                    this.toastService.error(response.message);
                    return;
                }

                this.toastService.success('Đặt đơn thành công');
                this.cart.set([]);
                this.closeMobileCart();
            },
            error: () => {
                this.ordering.set(false);
                this.toastService.error('Không thể đặt đơn');
            }
        });
    }

    openMobileCart(): void {
        this.isMobileCartOpen.set(true);
    }

    closeMobileCart(): void {
        this.isMobileCartOpen.set(false);
    }

    onQuantityInput(foodId: number, value: string): void {
        const quantity = Number(value.replace(/\D/g, ''));

        this.setQuantity(foodId, quantity);
    }

    back(): void {
        this.router.navigate([
            '/',
            URL_ENDPOINT.USER,
            URL_ENDPOINT.USER_STORES
        ]);
    }

    getItemAmount(item: CartItem): number {
        const optionAmount = item.selectedOptions.reduce(
            (sum, option) => sum + option.additionalPrice,
            0
        );

        return (item.food.price + optionAmount) * item.quantity;
    }

    getOptionText(item: CartItem): string {
        if (item.selectedOptions.length === 0) {
            return '';
        }

        return item.selectedOptions
            .map(option => `${option.optionGroupName}: ${option.optionName}`)
            .join(', ');
    }

    hasOptions(food: StoreFoodResponse): boolean {
        return (food.optionGroups ?? []).length > 0;
    }

    formatCurrency(value: number): string {
        return `${value.toLocaleString('vi-VN')}đ`;
    }
}