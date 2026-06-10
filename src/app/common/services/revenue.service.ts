import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse } from '../models/base-response.model';

import {
  AdminRevenueResponse,
  AgentRevenueResponse,
  RevenueQuery
} from '../models/revenue.model';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {
  private readonly apiService = inject(ApiService);

  getAdminRevenue(
    query: RevenueQuery
  ): Observable<BaseResponse<AdminRevenueResponse>> {
    return this.apiService.get<BaseResponse<AdminRevenueResponse>>(
      API_ENDPOINT.REVENUE.ADMIN,
      this.toQueryParams(query)
    );
  }

  getAgentRevenue(
    query: RevenueQuery
  ): Observable<BaseResponse<AgentRevenueResponse>> {
    return this.apiService.get<BaseResponse<AgentRevenueResponse>>(
      API_ENDPOINT.REVENUE.AGENT,
      this.toQueryParams(query)
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