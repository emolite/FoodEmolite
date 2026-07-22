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
import { StoreFoodCategoryService } from '../../../common/services/store-food-category.service';
import { StoreFoodCategoryResponse } from '../../../common/models/store-food-category.model';
import { SelectedStoreService } from '../../../common/services/selectedstore.service';
import { GuestService } from '../../../common/services/guest.service';

export interface CartItemOption {
    optionGroupId: number;
    optionGroupName: string;
    optionId: number;
    optionName: string;
    additionalPrice: number;
}

interface CartItem {
    id: number;
    food: StoreFoodResponse;
    quantity: number;
    note: string;
    selectedOptions: CartItemOption[];
    isDetailLoaded: boolean;
}

@Component({
    selector: 'app-page-user-store-foods',
    imports: [PopUpUserFoodOptionsComponent],
    templateUrl: './user-store-foods.html',
    styleUrl: './user-store-foods.css'
})
export class PageUserStoreFoodsComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly storeFoodService = inject(StoreFoodService);
    private readonly toastService = inject(ToastService);
    private readonly orderService = inject(OrderService);
    private readonly authService = inject(AuthService);
    private readonly categoryService = inject(StoreFoodCategoryService);
    private readonly selectedStoreService = inject(SelectedStoreService);
    private readonly guestService = inject(GuestService)
    private paymentInterval: any;
    private nextCartItemId = 1;

    categories = signal<StoreFoodCategoryResponse[]>([]);
    selectedCategoryId = signal<number | null>(null);
    isQrPopupOpen = signal(false);
    qrData = signal<any>(null);
    storeRefCode = signal('');
    foods = signal<StoreFoodResponse[]>([]);
    cart = signal<CartItem[]>([]);

    loading = signal(false);
    ordering = signal(false);
    isMobileCartOpen = signal(false);
    orderNote = signal('');

    hadGuestProfileOnOpen = signal(false);
    isGuestNameOpen = signal(false);      // popup A - nhập tên
    isConfirmOrderOpen = signal(false);   // popup B - cảnh báo xác nhận
    isOptionPopupOpen = signal(false);
    selectingCartId = signal<number | null>(null);
    pendingFood = signal<StoreFoodResponse | null>(null);

    guestCustomerName = computed(() => this.guestService.customerName());

    cartWidth = signal(380);
    isResizing = signal(false);

    isLoggedIn = computed(() => this.authService.isLoggedIn());

    selectedStoreInfo = computed(() => this.selectedStoreService.storeInfo());

    totalQuantity = computed(() =>
        this.cart().reduce((total, item) => total + item.quantity, 0)
    );

    activePopupFood = computed(() => {
        const editingId = this.selectingCartId();

        if (editingId !== null) {
            return this.cart().find(item => item.id === editingId)?.food ?? null;
        }

        return this.pendingFood();
    });

    activePopupOptions = computed(() => {
        const editingId = this.selectingCartId();

        if (editingId !== null) {
            return this.cart().find(item => item.id === editingId)?.selectedOptions ?? [];
        }

        return [];
    });

    qrImageUrl = computed(() => {
        const url = this.qrData()?.vietQrUrl;

        if (!url) return null;

        return url.replace(/-(compact2|compact|print)\.png/, '-qr_only.png');
    });

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
        const storeRefCode = this.selectedStoreService.storeRefCode() ?? '';

        if (!storeRefCode) {
            this.toastService.error('Không tìm thấy cửa hàng, vui lòng chọn lại');
            this.back();
            return;
        }

        this.route.queryParamMap.subscribe(params => {
            const orderCode = params.get('orderCode');
            const resume = params.get('resume');

            if (resume === 'true' && orderCode) {
                this.resumePayment(orderCode);
            }
        });

        this.storeRefCode.set(storeRefCode);
        this.loadCategories();
        this.loadFoods();
    }

    selectCategory(
        categoryId: number | null
    ): void {
        this.selectedCategoryId.set(categoryId);

        this.loadFoods();
    }

    ngOnDestroy() {
        if (this.paymentInterval) {
            clearInterval(this.paymentInterval);
            this.paymentInterval = null;
        }
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

    loadCategories(): void {
        this.categoryService
            .getByStoreRefCode(this.storeRefCode())
            .subscribe({
                next: response => {
                    if (
                        response.isSuccess &&
                        response.data
                    ) {
                        this.categories.set(
                            response.data
                        );
                    }
                }
            });
    }

    loadFoods(): void {
        this.loading.set(true);

        this.storeFoodService
            .getByStoreRefCode(
                this.storeRefCode(),
                this.selectedCategoryId(),
                1,
                100
            )
            .subscribe({
                next: response => {
                    this.loading.set(false);

                    this.foods.set(
                        response.items.filter(
                            food => food.isAvailable
                        )
                    );
                },
                error: () => {
                    this.loading.set(false);

                    this.toastService.error(
                        'Không tải được danh sách món ăn'
                    );
                }
            });
    }

    changeCategory(categoryId: number | null): void {
        this.selectedCategoryId.set(
            categoryId
        );

        this.loadFoods();
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
            this.increase(existed.id);
            return;
        }

        this.cart.update(items => [
            ...items,
            {
                id: this.nextCartItemId++,
                food,
                quantity: 1,
                note: '',
                selectedOptions: [],
                isDetailLoaded: true
            }
        ]);
    }

    increase(cartItemId: number): void {
        this.cart.update(items =>
            items.map(item =>
                item.id === cartItemId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    }

    decrease(cartItemId: number): void {
        this.cart.update(items =>
            items
                .map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                )
                .filter(item => item.quantity > 0)
        );
    }

    setQuantity(cartItemId: number, quantity: number): void {
        const nextQuantity = !quantity || quantity < 1
            ? 1
            : Math.floor(quantity);

        this.cart.update(items =>
            items.map(item =>
                item.id === cartItemId
                    ? { ...item, quantity: nextQuantity }
                    : item
            )
        );
    }

    remove(cartItemId: number): void {
        this.cart.update(items =>
            items.filter(item => item.id !== cartItemId)
        );
    }

    updateNote(cartItemId: number, note: string): void {
        this.cart.update(items =>
            items.map(item =>
                item.id === cartItemId
                    ? { ...item, note }
                    : item
            )
        );
    }

    updateGuestCustomerName(value: string): void {
        this.guestService.customerName.set(value);
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

    onQuantityInput(cartItemId: number, input: HTMLInputElement): void {
        const sanitizedValue = input.value.replace(/\D/g, '');

        if (!sanitizedValue) {
            input.value = '1';
            this.setQuantity(cartItemId, 1);
            return;
        }

        const quantity = Number(sanitizedValue);

        if (quantity < 1) {
            input.value = '1';
            this.setQuantity(cartItemId, 1);
            return;
        }

        input.value = quantity.toString();
        this.setQuantity(cartItemId, quantity);
    }

    openOptionPopup(cartItemId: number): void {
        const exists = this.cart().some(item => item.id === cartItemId);

        if (!exists) return;

        this.pendingFood.set(null);
        this.selectingCartId.set(cartItemId);
        this.isOptionPopupOpen.set(true);
    }

    openConfirmOrder(): void {
        if (this.cart().length === 0 || this.ordering()) return;

        if (this.hasMissingRequiredOptions()) {
            this.toastService.error('Vui lòng chọn đầy đủ option bắt buộc');
            return;
        }

        // Chưa đăng nhập và chưa có tên -> hỏi tên trước
        if (!this.isLoggedIn() && !this.hasGuestProfile()) {
            this.isGuestNameOpen.set(true);
            return;
        }

        // Đã có tên (hoặc đã login) -> đi thẳng vào cảnh báo xác nhận
        this.isConfirmOrderOpen.set(true);
    }

    submitGuestName(): void {
        if (!this.guestCustomerName().trim()) {
            this.toastService.error('Vui lòng nhập tên khách hàng');
            return;
        }

        this.isGuestNameOpen.set(false);
        this.isConfirmOrderOpen.set(true);
    }

    closeGuestNamePopup(): void {
        this.isGuestNameOpen.set(false);
    }

    confirmOrder(): void {
        this.isConfirmOrderOpen.set(false);
        this.createOrder();
    }

    closeConfirmOrder(): void {
        this.isConfirmOrderOpen.set(false);
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
        const editingId = this.selectingCartId();

        if (editingId !== null) {
            this.cart.update(items =>
                items.map(item =>
                    item.id === editingId
                        ? { ...item, selectedOptions: options }
                        : item
                )
            );

            this.closeOptionPopup();
            return;
        }

        const food = this.pendingFood();

        if (!food) {
            this.closeOptionPopup();
            return;
        }

        const existed = this.cart().find(item =>
            item.food.id === food.id &&
            this.sameOptions(item.selectedOptions, options)
        );

        if (existed) {
            this.increase(existed.id);
        } else {
            this.cart.update(items => [
                ...items,
                {
                    id: this.nextCartItemId++,
                    food,
                    quantity: 1,
                    note: '',
                    selectedOptions: options,
                    isDetailLoaded: true
                }
            ]);
        }

        this.closeOptionPopup();
    }

    private sameOptions(a: CartItemOption[], b: CartItemOption[]): boolean {
        if (a.length !== b.length) return false;

        const aIds = a.map(option => option.optionId).sort();
        const bIds = b.map(option => option.optionId).sort();

        return aIds.every((id, index) => id === bIds[index]);
    }

    closeOptionPopup(): void {
        this.isOptionPopupOpen.set(false);
        this.selectingCartId.set(null);
        this.pendingFood.set(null);
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
                customerName: this.guestCustomerName().trim(),
                deviceId: this.guestService.getGuestToken()
            });

        createOrder$.subscribe({
            next: response => {
                if (!response.isSuccess) {
                    this.ordering.set(false);
                    this.toastService.error(response.message);
                    return;
                }

                const order = response.data;
                if (!order) {
                    this.ordering.set(false);
                    this.toastService.error('Không tạo được đơn hàng');
                    return;
                }
                this.cart.set([]);
                this.closeMobileCart();

                this.orderService.getStorePaymentInfo(
                    order.orderCode
                ).subscribe({
                    next: (res) => {
                        if (!res.isSuccess) {
                            this.toastService.error(res.message);
                            return;
                        }

                        this.qrData.set(res.data);
                        this.isQrPopupOpen.set(true);
                        this.startPaymentPolling(order.orderCode);
                    },
                    error: () => {
                        this.toastService.error('Không tạo được QR thanh toán');
                    }
                });

                this.ordering.set(false);
            },
            error: () => {
                this.ordering.set(false);
                this.toastService.error('Không thể tạo đơn hàng');
            }
        });
    }

    hasGuestProfile = computed(() =>
        this.guestService.customerName().trim().length > 0
    );

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

    flyToCart(food: StoreFoodResponse): void {

        if (this.hasOptions(food)) {
            this.pendingFood.set(food);
            this.selectingCartId.set(null);
            this.isOptionPopupOpen.set(true);
            return;
        }

        // Desktop
        if (window.innerWidth >= 1024) {
            this.addToCart(food);
            return;
        }

        this.animateFly(food.id);

        setTimeout(() => {
            this.addToCart(food);
        }, 450);
    }

    private startPaymentPolling(orderCode: string) {
        this.paymentInterval = setInterval(() => {
            this.orderService.getPaymentStatus(orderCode).subscribe({
                next: res => {
                    if (res.isSuccess && res.data === 'PAID') {
                        clearInterval(this.paymentInterval);

                        this.isQrPopupOpen.set(false);
                        this.toastService.success('Thanh toán thành công');

                        this.router.navigate(['/success'], {
                            queryParams: {
                                orderCode,
                                amount: this.qrData()?.amount ?? null
                            }
                        });
                    }
                },
                error: () => {
                    clearInterval(this.paymentInterval);
                    this.toastService.error('Lỗi kiểm tra thanh toán');
                }
            });
        }, 3000);
    }

    private animateFly(foodId: number) {

        const img = document.getElementById(`food-img-${foodId}`);
        const cart = document.getElementById("mobile-cart-btn");

        if (!img || !cart) return;

        const imgRect = img.getBoundingClientRect();
        const cartRect = cart.getBoundingClientRect();

        const clone = img.cloneNode(true) as HTMLImageElement;

        clone.style.position = "fixed";
        clone.style.left = imgRect.left + "px";
        clone.style.top = imgRect.top + "px";
        clone.style.width = imgRect.width + "px";
        clone.style.height = imgRect.height + "px";
        clone.style.borderRadius = "14px";
        clone.style.pointerEvents = "none";
        clone.style.zIndex = "9999";
        clone.style.transition =
            "all .55s cubic-bezier(.22,.8,.3,1)";

        document.body.appendChild(clone);

        requestAnimationFrame(() => {

            clone.style.left =
                cartRect.left + cartRect.width / 2 - 18 + "px";

            clone.style.top =
                cartRect.top + cartRect.height / 2 - 18 + "px";

            clone.style.width = "36px";
            clone.style.height = "36px";

            clone.style.opacity = "0";

            clone.style.transform = "rotate(360deg) scale(.2)";

        });

        clone.addEventListener("transitionend", () => {

            clone.remove();

            cart.classList.add("cart-bounce");

            setTimeout(() => {
                cart.classList.remove("cart-bounce");
            }, 500);

        });

    }

    private resumePayment(orderCode: string): void {
        this.orderService.getPaymentStatus(orderCode).subscribe({
            next: status => {
                if (!status.isSuccess || status.data !== 'UNPAID') {
                    return;
                }

                this.orderService.getStorePaymentInfo(orderCode).subscribe({
                    next: res => {
                        if (!res.isSuccess) {
                            return;
                        }

                        this.qrData.set(res.data);
                        this.isQrPopupOpen.set(true);
                        this.startPaymentPolling(orderCode);
                    }
                });
            }
        });
    }
}