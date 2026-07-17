export const API_ENDPOINT = {
  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    VERIFY: 'auth/verify',
    CHECK_EMAIL: 'auth/check-email',
    CREATE_AGENT: 'auth/add-agent'
  },
  STORE: {
    BASE: 'stores',
    DETAIL: (id: number) => `stores/${id}`,
    OWNER: (ownerRefCode: string) => `stores/owner/${ownerRefCode}`
  },
  STORE_FOOD: {
    BASE: 'store-foods',
    DETAIL: (id: number) => `store-foods/${id}`,
    BY_STORE:`store-foods/store`
  },
  STORE_FOOD_CATEGORY: {
    BASE: 'store-food-categories',
    DETAIL: (id: number) => `store-food-categories/${id}`,
    SEARCH: 'store-food-categories/search',
    BY_STORE: `store-food-categories/get`
  },
  PROFILE: {
    LIST_ACC: 'profile/accounts-users',
    LIST_ACC_AGENTS: 'profile/accounts-agents',
    ME: 'profile/me',
    GUEST_PROFILE: 'profile/guest-profile',
    ACCOUNT_PROFILE: 'profile/account-profile',
    BANK_ACCOUNTS: 'profile/bank-accounts',
    STORE_PAYMENT: (orderCode: string) => `profile/store-payment/${encodeURIComponent(orderCode)}`
  },
  ORDER: {
    BASE: 'orders',
    GUEST: 'orders/guest',
    MY: 'orders/my',
    DETAIL: (id: number) => `orders/${id}`,
    STATUS: (id: number) => `orders/${id}/status`,
    STATUS_PAYMENT: (id: number) => `orders/${id}/payment-status`,
    ORDER_CANCEL: (id: number) => `orders/${id}/cancel`,
    PRINT: 'orders/print',
    BY_STORE: 'orders/store/search',
    PAYMENT_STATUS: (orderCode: string) => `orders/${orderCode}/payment-status`,
    PENDING_ORDER: 'orders/pending-order'
  },
  REVENUE: {
    ADMIN: 'revenue/admin',
    AGENT: 'revenue/agent'
  }
} as const;