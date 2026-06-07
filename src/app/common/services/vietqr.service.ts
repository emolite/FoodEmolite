import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VietQrBankResponse } from '../models/vietqr-bank.model';

@Injectable({
  providedIn: 'root'
})
export class VietQrService {
  private readonly http = inject(HttpClient);

  getBanks(): Observable<VietQrBankResponse> {
    return this.http.get<VietQrBankResponse>(
      'https://api.vietqr.io/v2/banks'
    );
  }
}