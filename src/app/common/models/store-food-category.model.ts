import { BaseSearchRequest } from './base-search.model';

export interface StoreFoodCategoryResponse {
  id: number;
  refCode: string;
  categoryName: string;
  description?: string;
  createdAt: string;
}

export interface StoreFoodCategorySearchRequest {
  keyword?: string;
}

export interface CreateStoreFoodCategoryRequest {
  categoryName: string;
  description?: string;
}

export interface UpdateStoreFoodCategoryRequest {
  id: number;
  categoryName: string;
  description?: string;
}