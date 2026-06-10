import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import {
  BaseResponse,
  CurrentUserResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiService = inject(ApiService);

  currentUser = signal<CurrentUserResponse | null>(null);
  token = signal<string | null>(localStorage.getItem('access_token'));
  isVerifying = signal(false);

  register(
    request: RegisterRequest
  ): Observable<BaseResponse<string>> {
    return this.apiService.post<BaseResponse<string>, RegisterRequest>(
      API_ENDPOINT.AUTH.REGISTER,
      request
    );
  }

  addagent(
    request: RegisterRequest
  ): Observable<BaseResponse<string>> {
    return this.apiService.post<BaseResponse<string>, RegisterRequest>(
      API_ENDPOINT.AUTH.CREATE_AGENT,
      request
    );
  }

  login(
    request: LoginRequest
  ): Observable<BaseResponse<LoginResponse>> {
    return this.apiService
      .post<BaseResponse<LoginResponse>, LoginRequest>(
        API_ENDPOINT.AUTH.LOGIN,
        request
      )
      .pipe(
        tap(response => {
          if (response.isSuccess && response.data) {
            localStorage.setItem('access_token', response.data.token);
            this.token.set(response.data.token);
          }
        })
      );
  }

  verify(): Observable<BaseResponse<CurrentUserResponse>> {
    return this.apiService
      .post<BaseResponse<CurrentUserResponse>, object>(
        API_ENDPOINT.AUTH.VERIFY,
        {}
      )
      .pipe(
        tap(response => {
          if (response.isSuccess && response.data) {
            this.currentUser.set(response.data);
            return;
          }

          this.logout();
        })
      );
  }

  verifyOnRefresh(): Observable<BaseResponse<CurrentUserResponse> | null> {
    const token = this.token();

    if (!token) {
      this.currentUser.set(null);
      return of(null);
    }

    this.isVerifying.set(true);

    return this.verify().pipe(
      tap(() => {
        this.isVerifying.set(false);
      }),
      catchError(() => {
        this.isVerifying.set(false);
        this.logout();
        return of(null);
      })
    );
  }

  checkEmail(email: string): Observable<BaseResponse<boolean>> {
    return this.apiService.get<BaseResponse<boolean>>(
      API_ENDPOINT.AUTH.CHECK_EMAIL,
      {
        email
      }
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.token.set(null);
    this.currentUser.set(null);
  }

  isLoggedIn(): boolean {
    return !!this.token();
  }
}