import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse, BaseTableResponse } from '../models/base-response.model';
import {
  CreateStoreRequest,
  StoreResponse,
  UpdateStoreRequest
} from '../models/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly apiService = inject(ApiService);

  getAll(
    page: number,
    pageSize: number
  ): Observable<BaseTableResponse<StoreResponse>> {
    return this.apiService.get<BaseTableResponse<StoreResponse>>(
      API_ENDPOINT.STORE.BASE,
      {
        page,
        pageSize
      }
    );
  }

  getDetail(
    id: number,
  ): Observable<BaseResponse<StoreResponse>> {
    return this.apiService.get<BaseResponse<StoreResponse>>(
      API_ENDPOINT.STORE.DETAIL(id)
    );
  }

  create(
    request: CreateStoreRequest
  ): Observable<BaseResponse<string>> {
    const formData = this.toCreateFormData(request);

    return this.apiService.post<BaseResponse<string>, FormData>(
      API_ENDPOINT.STORE.BASE,
      formData
    );
  }

  update(
    id: number,
    request: UpdateStoreRequest
  ): Observable<BaseResponse<string>> {
    const formData = this.toUpdateFormData(request);

    return this.apiService.put<BaseResponse<string>, FormData>(
      API_ENDPOINT.STORE.DETAIL(id),
      formData
    );
  }

  delete(
    id: number,
  ): Observable<BaseResponse<string>> {
    return this.apiService.delete<BaseResponse<string>>(
      API_ENDPOINT.STORE.DETAIL(id)
    );
  }

  private toCreateFormData(
    request: CreateStoreRequest
  ): FormData {
    const formData = new FormData();

    formData.append('storeName', request.storeName);

    if (request.thumbnailFile) {
      formData.append('thumbnailFile', request.thumbnailFile);
    }

    if (request.phoneNumber) {
      formData.append('phoneNumber', request.phoneNumber);
    }

    if (request.address) {
      formData.append('address', request.address);
    }

    if (request.description) {
      formData.append('description', request.description);
    }

    return formData;
  }

  private toUpdateFormData(
    request: UpdateStoreRequest
  ): FormData {
    const formData = new FormData();

    formData.append('storeName', request.storeName);
    formData.append('isActive', String(request.isActive));

    if (request.thumbnailFile) {
      formData.append('thumbnailFile', request.thumbnailFile);
    }

    if (request.thumbnailFileRefCode) {
      formData.append('thumbnailFileRefCode', request.thumbnailFileRefCode);
    }

    if (request.phoneNumber) {
      formData.append('phoneNumber', request.phoneNumber);
    }

    if (request.address) {
      formData.append('address', request.address);
    }

    if (request.description) {
      formData.append('description', request.description);
    }

    return formData;
  }
}