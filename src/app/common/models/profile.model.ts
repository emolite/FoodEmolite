import { StoreResponse } from './store.model';

export interface MyProfileResponse {
  account: AccountResponse;
  profile: AccountProfileResponse | null;
  bankAccounts: BankAccountResponse[];
  store: StoreResponse | null;
}

export interface AccountResponse {
  id: number;
  refCode: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AccountProfileResponse {
  id: number;
  refCode: string;
  accountId: number;
  fullName: string;
  phoneNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
}

export interface BankAccountResponse {
  id: number;
  refCode: string;
  accountId: number;
  bankName: string;
  bankCode?: string | null;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface CreateAccountProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  avatarUrl?: File | null;
}

export interface UpdateAccountProfileRequest {
  fullName: string;
  phoneNumber?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  avatarUrl?: File | null;
}

export interface CreateBankAccountRequest {
  bankName: string;
  bankCode?: string | null;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
}

export interface UpdateBankAccountRequest {
  bankName: string;
  bankCode?: string | null;
  accountNumber: string;
  accountHolderName: string;
  isDefault: boolean;
}