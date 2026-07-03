import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../constants/api.service';
import { API_ENDPOINT } from '../constants/api-endpoint';

import {
  BaseResponse,
  BaseTableResponse
} from '../models/base-response.model';

import { CreateStoreFoodCategoryRequest, StoreFoodCategoryResponse, StoreFoodCategorySearchRequest, UpdateStoreFoodCategoryRequest } from '../models/store-food-category.model';

import { BaseSearchRequest } from '../models/base-search.model';

@Injectable({
  providedIn: 'root'
})
export class StoreFoodCategoryService {
  private readonly apiService =
    inject(ApiService);

  getByStoreRefCode(
    storeRefCode: string
  ): Observable<BaseResponse<StoreFoodCategoryResponse[]>> {
    return this.apiService.get<
      BaseResponse<StoreFoodCategoryResponse[]>
    >(
      API_ENDPOINT.STORE_FOOD_CATEGORY.BY_STORE(
        storeRefCode
      )
    );
  }

  search(
    request: BaseSearchRequest<StoreFoodCategorySearchRequest>
  ): Observable<
    BaseTableResponse<StoreFoodCategoryResponse>
  > {
    return this.apiService.post<
      BaseTableResponse<StoreFoodCategoryResponse>,
      BaseSearchRequest<StoreFoodCategorySearchRequest>
    >(
      API_ENDPOINT.STORE_FOOD_CATEGORY.SEARCH,
      request
    );
  }

  create(
    request: CreateStoreFoodCategoryRequest
  ): Observable<BaseResponse<string>> {
    return this.apiService.post<
      BaseResponse<string>,
      CreateStoreFoodCategoryRequest
    >(
      API_ENDPOINT.STORE_FOOD_CATEGORY.BASE,
      request
    );
  }

  update(
    request: UpdateStoreFoodCategoryRequest
  ): Observable<BaseResponse<string>> {
    return this.apiService.put<
      BaseResponse<string>,
      UpdateStoreFoodCategoryRequest
    >(
      API_ENDPOINT.STORE_FOOD_CATEGORY.BASE,
      request
    );
  }

  delete(
    id: number
  ): Observable<BaseResponse<string>> {
    return this.apiService.delete<
      BaseResponse<string>
    >(
      API_ENDPOINT.STORE_FOOD_CATEGORY.DETAIL(id)
    );
  }
}