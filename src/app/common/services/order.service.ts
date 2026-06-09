import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse } from '../models/base-response.model';
import { BaseTableResponse } from '../models/base-response.model';
import {
    CreateOrderRequest,
    OrderResponse,
    UpdateOrderStatusRequest,
    UpdatePaymentStatusRequest
} from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly apiService = inject(ApiService);

    create(
        request: CreateOrderRequest
    ): Observable<BaseResponse<string>> {
        return this.apiService.post<BaseResponse<string>, CreateOrderRequest>(
            API_ENDPOINT.ORDER.BASE,
            request
        );
    }

    getMyOrders(
        page: number = 1,
        pageSize: number = 10
    ): Observable<BaseTableResponse<OrderResponse>> {
        return this.apiService.get<BaseTableResponse<OrderResponse>>(
            `${API_ENDPOINT.ORDER.MY}?page=${page}&pageSize=${pageSize}`
        );
    }

    getDetail(
        id: number
    ): Observable<BaseResponse<OrderResponse>> {
        return this.apiService.get<BaseResponse<OrderResponse>>(
            API_ENDPOINT.ORDER.DETAIL(id)
        );
    }

    getByStoreRefCode(
        storeRefCode: string,
        page: number = 1,
        pageSize: number = 10
    ): Observable<BaseTableResponse<OrderResponse>> {
        return this.apiService.get<BaseTableResponse<OrderResponse>>(
            `${API_ENDPOINT.ORDER.BY_STORE(storeRefCode)}?page=${page}&pageSize=${pageSize}`
        );
    }

    updateStatus(
        id: number,
        request: UpdateOrderStatusRequest
    ): Observable<BaseResponse<string>> {
        return this.apiService.put<BaseResponse<string>, UpdateOrderStatusRequest>(
            API_ENDPOINT.ORDER.STATUS(id),
            request
        );
    }

    updatePaymentStatus(
        id: number,
        request: UpdatePaymentStatusRequest
    ): Observable<BaseResponse<string>> {
        return this.apiService.put<BaseResponse<string>, UpdatePaymentStatusRequest>(
            API_ENDPOINT.ORDER.STATUS_PAYMENT(id),
            request
        );
    }
}