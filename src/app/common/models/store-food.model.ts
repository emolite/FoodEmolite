export interface StoreFoodOptionResponse {
  id: number;
  refCode: string;
  optionName: string;
  additionalPrice: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface StoreFoodOptionGroupResponse {
  id: number;
  refCode: string;
  groupName: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  options: StoreFoodOptionResponse[];
}

export interface StoreFoodResponse {
  id: number;
  refCode: string;
  storeRefCode: string;
  storeName: string;
  foodName: string;
  thumbnailUrl: string | null;
  description: string | null;
  price: number;
  quantity: number;
  isAvailable: boolean;
  storeFoodCategoryId: number;
  optionGroups: StoreFoodOptionGroupResponse[];
}

export interface StoreFoodOptionRequest {
  id?: number | null;
  optionName: string;
  additionalPrice: number;
  isAvailable: boolean;
  sortOrder: number;
  isDeleted?: boolean;
}

export interface StoreFoodOptionGroupRequest {
  id?: number | null;
  groupName: string;
  isRequired: boolean;
  minSelect: number;
  maxSelect: number;
  sortOrder: number;
  isDeleted?: boolean;
  options: StoreFoodOptionRequest[];
}

export interface GetStoreFoodsRequest {
  storeRefCode: string;
  storeFoodCategoryId?: number | null;
}

export interface CreateStoreFoodRequest {
  storeRefCode: string;
  foodName: string;
  thumbnailFile?: File | null;
  description?: string | null;
  price: number;
  quantity: number;
  storeFoodCategoryId: number | null;
  optionGroups: StoreFoodOptionGroupRequest[];
}

export interface UpdateStoreFoodRequest {
  foodName: string;
  thumbnailFile?: File | null;
  thumbnailUrl?: string | null;
  description?: string | null;
  price: number;
  quantity: number;
  isAvailable: boolean;
  storeFoodCategoryId: number | null;
  optionGroups: StoreFoodOptionGroupRequest[];
}