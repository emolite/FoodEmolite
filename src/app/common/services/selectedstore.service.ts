// common/services/selected-store.service.ts
import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'selected_store_ref_code';

@Injectable({
  providedIn: 'root'
})
export class SelectedStoreService {
  private readonly _storeRefCode = signal<string | null>(
    sessionStorage.getItem(STORAGE_KEY)
  );

  storeRefCode = this._storeRefCode.asReadonly();

  setStoreRefCode(refCode: string): void {
    sessionStorage.setItem(STORAGE_KEY, refCode);
    this._storeRefCode.set(refCode);
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this._storeRefCode.set(null);
  }
}