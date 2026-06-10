export interface StoreResponse {
  id: number;
  refCode: string;
  ownerAccountId: number;
  storeName: string;
  thumbnailFileRefCode: string | null;
  thumbnailUrl: string | null;
  phoneNumber: string | null;
  address: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateStoreRequest {
  storeName: string;
  ownerAccountId: number;
  thumbnailFile: File | null;
  phoneNumber: string | null;
  address: string | null;
  description: string | null;
}

export interface UpdateStoreRequest {
  storeName: string;
  thumbnailFile: File | null;
  thumbnailFileRefCode: string | null;
  phoneNumber: string | null;
  address: string | null;
  description: string | null;
  isActive: boolean;
}

export interface StoreFilter {
  storeName: string;
  isActive: boolean | '';
}