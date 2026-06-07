import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse, BaseTableResponse } from '../models/base-response.model';
import {
  CreateStoreFoodRequest,
  StoreFoodResponse,
  UpdateStoreFoodRequest
} from '../models/store-food.model';

@Injectable({
  providedIn: 'root'
})
export class StoreFoodService {
  private readonly apiService = inject(ApiService);

  getAll(
    page: number,
    pageSize: number
  ): Observable<BaseTableResponse<StoreFoodResponse>> {
    return this.apiService.get<BaseTableResponse<StoreFoodResponse>>(
      API_ENDPOINT.STORE_FOOD.BASE,
      {
        page,
        pageSize
      }
    );
  }

  getByStoreRefCode(
    storeRefCode: string,
    page: number,
    pageSize: number
  ): Observable<BaseTableResponse<StoreFoodResponse>> {
    return this.apiService.get<BaseTableResponse<StoreFoodResponse>>(
      API_ENDPOINT.STORE_FOOD.BY_STORE(storeRefCode),
      {
        page,
        pageSize
      }
    );
  }

  getDetail(
    id: number,
  ): Observable<BaseResponse<StoreFoodResponse>> {
    return this.apiService.get<BaseResponse<StoreFoodResponse>>(
      API_ENDPOINT.STORE_FOOD.DETAIL(id)
    );
  }

  create(
    request: CreateStoreFoodRequest
  ): Observable<BaseResponse<string>> {
    const formData = this.toCreateFormData(request);

    return this.apiService.post<BaseResponse<string>, FormData>(
      API_ENDPOINT.STORE_FOOD.BASE,
      formData
    );
  }

  update(
    id: number,
    request: UpdateStoreFoodRequest
  ): Observable<BaseResponse<string>> {
    const formData = this.toUpdateFormData(request);

    return this.apiService.put<BaseResponse<string>, FormData>(
      API_ENDPOINT.STORE_FOOD.DETAIL(id),
      formData
    );
  }

  delete(
    id: number,
  ): Observable<BaseResponse<string>> {
    return this.apiService.delete<BaseResponse<string>>(
      API_ENDPOINT.STORE_FOOD.DETAIL(id)
    );
  }

  private toCreateFormData(
    request: CreateStoreFoodRequest
  ): FormData {
    const formData = new FormData();

    formData.append('storeRefCode', request.storeRefCode);
    formData.append('foodName', request.foodName);
    formData.append('price', String(request.price));
    formData.append('quantity', String(request.quantity));

    if (request.thumbnailFile) {
      formData.append('thumbnailFile', request.thumbnailFile);
    }

    if (request.description) {
      formData.append('description', request.description);
    }

    return formData;
  }

  private toUpdateFormData(
    request: UpdateStoreFoodRequest
  ): FormData {
    const formData = new FormData();

    formData.append('foodName', request.foodName);
    formData.append('price', String(request.price));
    formData.append('quantity', String(request.quantity));
    formData.append('isAvailable', String(request.isAvailable));

    if (request.thumbnailFile) {
      formData.append('thumbnailFile', request.thumbnailFile);
    }

    if (request.thumbnailUrl) {
      formData.append('thumbnailUrl', request.thumbnailUrl);
    }

    if (request.description) {
      formData.append('description', request.description);
    }

    return formData;
  }
}