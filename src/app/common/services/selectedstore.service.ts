// common/services/selected-store.service.ts
import { Injectable, signal } from '@angular/core';
import { StoreResponse } from '../models/store.model';

const STORAGE_KEY = 'selected_store_ref_code';
const STORE_INFO_STORAGE_KEY = 'selected_store_info';

export interface SelectedStoreInfo {
  storeName: string;
  address: string | null;
  thumbnailUrl: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SelectedStoreService {
  private readonly _storeRefCode = signal<string | null>(
    sessionStorage.getItem(STORAGE_KEY)
  );

  private readonly _storeInfo = signal<SelectedStoreInfo | null>(
    this.readStoredInfo()
  );

  storeRefCode = this._storeRefCode.asReadonly();
  storeInfo = this._storeInfo.asReadonly();

  setStoreRefCode(refCode: string): void {
    sessionStorage.setItem(STORAGE_KEY, refCode);
    this._storeRefCode.set(refCode);
  }

  setStore(store: StoreResponse): void {
    const info: SelectedStoreInfo = {
      storeName: store.storeName,
      address: store.address,
      thumbnailUrl: store.thumbnailUrl
    };

    sessionStorage.setItem(STORAGE_KEY, store.refCode);
    sessionStorage.setItem(STORE_INFO_STORAGE_KEY, JSON.stringify(info));

    this._storeRefCode.set(store.refCode);
    this._storeInfo.set(info);
  }

  clear(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORE_INFO_STORAGE_KEY);
    this._storeRefCode.set(null);
    this._storeInfo.set(null);
  }

  private readStoredInfo(): SelectedStoreInfo | null {
    const raw = sessionStorage.getItem(STORE_INFO_STORAGE_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw) as SelectedStoreInfo;
    } catch {
      return null;
    }
  }
}