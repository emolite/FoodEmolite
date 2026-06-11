import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINT } from '../constants/api-endpoint';
import { ApiService } from '../constants/api.service';
import { BaseResponse, BaseTableResponse } from '../models/base-response.model';
import {
  AccountProfileResponse,
  BankAccountResponse,
  CreateAccountProfileRequest,
  CreateBankAccountRequest,
  MyProfileResponse,
  StorePaymentInfoResponse,
  UpdateAccountProfileRequest,
  UpdateBankAccountRequest,
  UserProfileResponse
} from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiService = inject(ApiService);

  getMyProfile(): Observable<BaseResponse<MyProfileResponse>> {
    return this.apiService.get<BaseResponse<MyProfileResponse>>(
      API_ENDPOINT.PROFILE.ME
    );
  }

  getStorePaymentInfo(
    storeRefCode: string,
    amount: number,
    orderCode: string
  ): Observable<BaseResponse<StorePaymentInfoResponse>> {
    return this.apiService.get<BaseResponse<StorePaymentInfoResponse>>(
      API_ENDPOINT.PROFILE.STORE_PAYMENT(storeRefCode, amount, orderCode)
    );
  }

  createAccountProfile(
    request: CreateAccountProfileRequest
  ): Observable<BaseResponse<AccountProfileResponse>> {
    return this.apiService.post<BaseResponse<AccountProfileResponse>, FormData>(
      API_ENDPOINT.PROFILE.ACCOUNT_PROFILE,
      this.toAccountProfileFormData(request)
    );
  }

  updateAccountProfile(
    request: UpdateAccountProfileRequest
  ): Observable<BaseResponse<AccountProfileResponse>> {
    return this.apiService.put<BaseResponse<AccountProfileResponse>, FormData>(
      API_ENDPOINT.PROFILE.ACCOUNT_PROFILE,
      this.toAccountProfileFormData(request)
    );
  }

  createBankAccount(
    request: CreateBankAccountRequest
  ): Observable<BaseResponse<BankAccountResponse>> {
    return this.apiService.post<BaseResponse<BankAccountResponse>, CreateBankAccountRequest>(
      API_ENDPOINT.PROFILE.BANK_ACCOUNTS,
      request
    );
  }

  updateBankAccount(
    request: UpdateBankAccountRequest
  ): Observable<BaseResponse<BankAccountResponse>> {
    return this.apiService.put<BaseResponse<BankAccountResponse>, UpdateBankAccountRequest>(
      API_ENDPOINT.PROFILE.BANK_ACCOUNTS,
      request
    );
  }

  getAllUserProfiles(
    page: number = 1,
    pageSize: number = 10
  ): Observable<BaseTableResponse<UserProfileResponse>> {
    return this.apiService.get<BaseTableResponse<UserProfileResponse>>(
      API_ENDPOINT.PROFILE.LIST_ACC,
      {
        page,
        pageSize
      }
    );
  }

  getAllAgentProfiles(
    page: number = 1,
    pageSize: number = 10
  ): Observable<BaseTableResponse<MyProfileResponse>> {
    return this.apiService.get<BaseTableResponse<MyProfileResponse>>(
      API_ENDPOINT.PROFILE.LIST_ACC_AGENTS,
      {
        page,
        pageSize
      }
    );
  }

  generateVietQrUrl(bank: BankAccountResponse | CreateBankAccountRequest | UpdateBankAccountRequest): string {
    if (!bank.bankCode || !bank.accountNumber) {
      return '';
    }

    const accountName = encodeURIComponent(bank.accountHolderName || '');

    return `https://img.vietqr.io/image/${bank.bankCode}-${bank.accountNumber}-compact2.png?accountName=${accountName}`;
  }

  private toAccountProfileFormData(
    request: CreateAccountProfileRequest | UpdateAccountProfileRequest
  ): FormData {
    const formData = new FormData();

    formData.append('fullName', request.fullName);

    if (request.avatarUrl) {
      formData.append('avatarUrl', request.avatarUrl);
    }

    if (request.phoneNumber) {
      formData.append('phoneNumber', request.phoneNumber);
    }

    if (request.gender) {
      formData.append('gender', request.gender);
    }

    if (request.dateOfBirth) {
      formData.append('dateOfBirth', request.dateOfBirth);
    }

    if (request.address) {
      formData.append('address', request.address);
    }

    return formData;
  }
}