import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { OrderService } from './order.service';
import { URL_ENDPOINT } from '../constants/url-endpoint';
import { ProfileService } from './profile.service';

@Injectable({
  providedIn: 'root'
})
export class GuestService {
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly profileService = inject(ProfileService);

  customerName = signal('');
  guestToken = signal<string | null>(
    localStorage.getItem('guest_token')
  );

  initialize(): Observable<string> {
    let token = this.guestToken();

    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem('guest_token', token);
      this.guestToken.set(token);
    }

    return of(token).pipe(
      tap(() => {
        this.loadProfile();
        this.checkPendingOrder();
      })
    );
  }

  getGuestToken(): string {
    return this.guestToken()!;
  }

  clearGuest(): void {
    localStorage.removeItem('guest_token');
    this.guestToken.set(null);
  }

  private loadProfile(): void {
    const deviceId = this.guestToken();

    if (!deviceId) {
      return;
    }

    this.profileService.getGuestProfile(deviceId).subscribe({
      next: res => {
        if (res.isSuccess && res.data) {
          this.customerName.set(res.data.customerName);
        }
      }
    });
  }

  private checkPendingOrder(): void {
    const deviceId = this.guestToken();

    if (!deviceId) {
      return;
    }

    this.orderService.checkPendingOrder(deviceId).subscribe({
      next: res => {
        if (!res.isSuccess || !res.data) {
          return;
        }

        this.router.navigate(
          ['/', URL_ENDPOINT.USER, URL_ENDPOINT.USER_STORE_FOODS, URL_ENDPOINT.USER_ORDER],
          {
            queryParams: {
              orderCode: res.data,
              resume: true
            }
          }
        );
      }
    });
  }
}