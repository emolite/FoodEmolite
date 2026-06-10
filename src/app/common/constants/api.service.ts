import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

export type ApiQueryParams = Record<string, string | number | boolean>;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<TResponse>(
    endpoint: string,
    params?: ApiQueryParams
  ): Observable<TResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        httpParams = httpParams.set(key, String(params[key]));
      });
    }

    return this.http.get<TResponse>(
      `${this.baseUrl}/${endpoint}`,
      {
        params: httpParams
      }
    );
  }

  post<TResponse, TRequest>(
    endpoint: string,
    body: TRequest
  ): Observable<TResponse> {
    return this.http.post<TResponse>(
      `${this.baseUrl}/${endpoint}`,
      body
    );
  }

  postBlob<TRequest>(
    endpoint: string,
    body: TRequest
  ): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/${endpoint}`,
      body,
      {
        responseType: 'blob'
      }
    );
  }

  put<TResponse, TRequest>(
    endpoint: string,
    body: TRequest
  ): Observable<TResponse> {
    return this.http.put<TResponse>(
      `${this.baseUrl}/${endpoint}`,
      body
    );
  }

  delete<TResponse>(endpoint: string): Observable<TResponse> {
    return this.http.delete<TResponse>(
      `${this.baseUrl}/${endpoint}`
    );
  }
}