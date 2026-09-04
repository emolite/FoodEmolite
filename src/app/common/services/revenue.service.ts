import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse, BaseTableResponse } from '../models/base-response.model';
import { BaseSearchRequest } from '../models/base-search.model';

import {
  AgentRevenueResponse,
  ProductRevenueSearchRequest,
  RevenueQuery,
  TopSellingProduct
} from '../models/revenue.model';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {
  private readonly apiService = inject(ApiService);

  getAgentRevenue(
    query: RevenueQuery
  ): Observable<BaseResponse<AgentRevenueResponse>> {
    return this.apiService.get<BaseResponse<AgentRevenueResponse>>(
      API_ENDPOINT.REVENUE.AGENT,
      this.toQueryParams(query)
    );
  }

  getAgentTopProducts(
    query: RevenueQuery,
    top: number = 10
  ): Observable<BaseResponse<TopSellingProduct[]>> {
    return this.apiService.get<BaseResponse<TopSellingProduct[]>>(
      API_ENDPOINT.REVENUE.AGENT_TOP_PRODUCTS,
      { ...this.toQueryParams(query), top }
    );
  }

  searchAgentProductRevenue(
    request: BaseSearchRequest<ProductRevenueSearchRequest>
  ): Observable<BaseTableResponse<TopSellingProduct>> {
    return this.apiService.post<
      BaseTableResponse<TopSellingProduct>,
      BaseSearchRequest<ProductRevenueSearchRequest>
    >(
      API_ENDPOINT.REVENUE.AGENT_PRODUCTS_SEARCH,
      request
    );
  }

  private toQueryParams(query: RevenueQuery) {
    return {
      ...(query.fromDate ? { fromDate: query.fromDate } : {}),
      ...(query.toDate ? { toDate: query.toDate } : {}),
      ...(query.groupBy ? { groupBy: query.groupBy } : {})
    };
  }
}