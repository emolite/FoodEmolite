export interface NewOrderNotification {
    orderId: number;
    orderCode: string;
    storeRefCode: string;
    customerName: string;
    totalAmount: number;
    createdAt: string;
}

export interface FoodQuantityChangedNotification {
    storeFoodId: number;
    storeRefCode: string;
    quantity: number;
}

export interface PromotionStatusChangedNotification {
    promotionId: number;
    storeRefCode: string;
    status: string;
}
