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
import { AuthService } from '../../../common/services/auth.service';
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
    imports: [PopUpUserFoodOptionsComponent],
    templateUrl: './user-store-foods.html'
})
export class PageUserStoreFoodsComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeFoodService = inject(StoreFoodService);
    private readonly toastService = inject(ToastService);
    private readonly orderService = inject(OrderService);
    private readonly authService = inject(AuthService);

    storeRefCode = signal('');
    foods = signal<StoreFoodResponse[]>([]);
    cart = signal<CartItem[]>([]);

    loading = signal(false);
    ordering = signal(false);
    isMobileCartOpen = signal(false);
    orderNote = signal('');

    isConfirmOrderOpen = signal(false);
    isOptionPopupOpen = signal(false);
    selectingCartIndex = signal<number | null>(null);

    guestCustomerName = signal('');

    cartWidth = signal(380);
    isResizing = signal(false);

    isLoggedIn = computed(() => this.authService.isLoggedIn());

    totalQuantity = computed(() =>
        this.cart().reduce((total, item) => total + item.quantity, 0)
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

        this.cartWidth.set(Math.min(Math.max(width, min), max));
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
                this.foods.set(response.items.filter(food => food.isAvailable));
            },
            error: () => {
                this.loading.set(false);
                this.toastService.error('Không tải được danh sách món ăn');
            }
        });
    }

    updateOrderNote(value: string): void {
        this.orderNote.set(value);
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

        this.storeFoodService.getDetail(food.id).subscribe({
            next: response => {
                const foodDetail = response.isSuccess && response.data
                    ? response.data
                    : food;

                this.cart.update(items => [
                    ...items,
                    {
                        food: foodDetail,
                        quantity: 1,
                        note: '',
                        selectedOptions: [],
                        isDetailLoaded: true
                    }
                ]);
            },
            error: () => {
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
        });
    }

    increase(foodId: number): void {
        this.cart.update(items =>
            items.map(item =>
                item.food.id === foodId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }

    decrease(foodId: number): void {
        this.cart.update(items =>
            items
                .map(item =>
                    item.food.id === foodId
                        ? { ...item, quantity: item.quantity - 1 }
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
                    ? { ...item, quantity: nextQuantity }
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
                    ? { ...item, note }
                    : item
            )
        );
    }

    updateGuestCustomerName(value: string): void {
        this.guestCustomerName.set(value);
    }

    blockInvalidQuantityKey(event: KeyboardEvent): void {
        const allowedKeys = [
            'Backspace',
            'Delete',
            'Tab',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End'
        ];

        if (allowedKeys.includes(event.key)) return;

        if (!/^\d$/.test(event.key)) {
            event.preventDefault();
        }
    }

    onQuantityInput(foodId: number, input: HTMLInputElement): void {
        const sanitizedValue = input.value.replace(/\D/g, '');

        if (!sanitizedValue) {
            input.value = '1';
            this.setQuantity(foodId, 1);
            return;
        }

        const quantity = Number(sanitizedValue);

        if (quantity < 1) {
            input.value = '1';
            this.setQuantity(foodId, 1);
            return;
        }

        input.value = quantity.toString();
        this.setQuantity(foodId, quantity);
    }

    openOptionPopup(foodId: number): void {
        const index = this.cart().findIndex(item => item.food.id === foodId);

        if (index < 0) return;

        const item = this.cart()[index];

        if (item.isDetailLoaded) {
            this.selectingCartIndex.set(index);
            this.isOptionPopupOpen.set(true);
            return;
        }

        this.storeFoodService.getDetail(item.food.id).subscribe({
            next: response => {
                if (!response.isSuccess || !response.data) {
                    this.toastService.error(response.message || 'Không tải được tùy chọn món');
                    return;
                }

                const foodDetail: StoreFoodResponse = response.data;

                this.cart.update(items =>
                    items.map((cartItem, itemIndex) =>
                        itemIndex === index
                            ? {
                                ...cartItem,
                                food: foodDetail,
                                isDetailLoaded: true
                            }
                            : cartItem
                    )
                );

                this.selectingCartIndex.set(index);
                this.isOptionPopupOpen.set(true);
            },
            error: () => {
                this.toastService.error('Không tải được tùy chọn món');
            }
        });
    }

    openConfirmOrder(): void {
        if (this.cart().length === 0 || this.ordering()) return;

        if (this.hasMissingRequiredOptions()) {
            this.toastService.error('Vui lòng chọn đầy đủ option bắt buộc');
            return;
        }

        this.isConfirmOrderOpen.set(true);
    }

    closeConfirmOrder(): void {
        this.isConfirmOrderOpen.set(false);
    }

    confirmOrder(): void {
        if (!this.isLoggedIn() && !this.guestCustomerName().trim()) {
            this.toastService.error('Vui lòng nhập tên khách hàng');
            return;
        }

        this.isConfirmOrderOpen.set(false);
        this.createOrder();
    }

    hasMissingRequiredOptions(): boolean {
        return this.cart().some(item => this.isCartItemMissingRequiredOption(item));
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
                    ? { ...item, selectedOptions: options }
                    : item
            )
        );

        this.isOptionPopupOpen.set(false);
        this.selectingCartIndex.set(null);
    }

    closeOptionPopup(): void {
        this.isOptionPopupOpen.set(false);
        this.selectingCartIndex.set(null);
    }

    createOrder(): void {
        if (this.cart().length === 0 || this.ordering()) return;

        this.ordering.set(true);

        const request = {
            storeRefCode: this.storeRefCode(),
            note: this.orderNote().trim() || null,
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
        };

        const createOrder$ = this.isLoggedIn()
            ? this.orderService.create(request)
            : this.orderService.createGuest({
                ...request,
                customerName: this.guestCustomerName().trim()
            });

        createOrder$.subscribe({
            next: response => {
                this.ordering.set(false);

                if (!response.isSuccess) {
                    this.toastService.error(response.message);
                    return;
                }

                this.toastService.success('Đặt đơn thành công');
                this.cart.set([]);
                this.guestCustomerName.set('');
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
        if (item.selectedOptions.length === 0) return '';

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