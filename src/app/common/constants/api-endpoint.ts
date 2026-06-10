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
    BY_STORE: (storeRefCode: string) => `store-foods/store/${storeRefCode}`
  },
  PROFILE: {
    LIST_ACC: 'profile/accounts-users',
    LIST_ACC_AGENTS: 'profile/accounts-agents',
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
    PRINT: 'orders/print',
    BY_STORE: (storeRefCode: string) => `orders/store/${storeRefCode}`
  },
  REVENUE: {
    ADMIN: 'revenue/admin',
    AGENT: 'revenue/agent'
  }
} as const;