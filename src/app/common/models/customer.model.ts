export interface CustomerListItem {
    refCode: string;
    customerName: string;
    phoneNumber: string | null;
    email: string | null;
    avatarUrl: string | null;
    isGuest: boolean;
    totalOrders: number;
    totalSpent: number;
    lastOrderAt: string | null;
    storeRefCode: string;
    storeName: string;
}

export interface CustomerSearchRequest {
    keyword?: string | null;
    storeRefCode?: string | null;
}
