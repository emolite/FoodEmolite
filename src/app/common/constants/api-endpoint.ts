export const API_ENDPOINT = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    VERIFY: 'auth/verify',
    CHECK_EMAIL: 'auth/check-email'
  },
  STORE: {
    BASE: 'stores',
    DETAIL: (id: number) => `stores/${id}`,
    OWNER: (ownerRefCode: string) => `stores/owner/${ownerRefCode}`
  },
  STORE_FOOD: {
    BASE: 'store-foods',
    DETAIL: (id: number) => `store-foods/${id}`,
    BY_STORE: (storeRefCode: string) => `store-foods/store/${storeRefCode}`
  },
   PROFILE: {
    ME: 'profile/me',
    ACCOUNT_PROFILE: 'profile/account-profile',
    BANK_ACCOUNTS: 'profile/bank-accounts',
    STORE_PAYMENT: (storeRefCode: string, amount: number) => `profile/store-payment/${storeRefCode}?amount=${amount}`
  },
  ORDER: {
    BASE: 'orders',
    MY: 'orders/my',
    DETAIL: (id: number) => `orders/${id}`,
    STATUS: (id: number) => `orders/${id}/status`,
    STATUS_PAYMENT: (id: number) => `orders/${id}/payment-status`,
    BY_STORE: (storeRefCode: string) => `orders/store/${storeRefCode}`
  }
} as const;