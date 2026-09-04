import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse, BaseTableResponse } from '../models/base-response.model';
import { StoreResponse } from '../models/store.model';

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

  getByRefCode(
    refCode: string,
  ): Observable<BaseResponse<StoreResponse>> {
    return this.apiService.get<BaseResponse<StoreResponse>>(
      API_ENDPOINT.STORE.BY_REF(refCode)
    );
  }
}