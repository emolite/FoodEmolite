import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environment/environment';
import {
    FoodQuantityChangedNotification,
    NewOrderNotification,
    PromotionStatusChangedNotification
} from '../models/realtime.model';

/**
 * Shared SignalR connection for the whole app. Any feature area can inject this
 * service, call connect() + joinStoreGroup() once, and subscribe to the exposed
 * streams (or add a new stream here when a new realtime event is introduced).
 */
@Injectable({
    providedIn: 'root'
})
export class RealtimeService {
    private hubConnection: signalR.HubConnection | null = null;
    private joinedStoreRefCode: string | null = null;
    private joinedPublicStoreRefCode: string | null = null;

    readonly isConnected = signal(false);

    private readonly newOrderSubject = new Subject<NewOrderNotification>();
    private readonly foodQuantityChangedSubject = new Subject<FoodQuantityChangedNotification>();
    private readonly promotionStatusChangedSubject = new Subject<PromotionStatusChangedNotification>();

    readonly newOrder$ = this.newOrderSubject.asObservable();
    readonly foodQuantityChanged$ = this.foodQuantityChangedSubject.asObservable();
    readonly promotionStatusChanged$ = this.promotionStatusChangedSubject.asObservable();

    connect(): void {
        if (this.hubConnection) {
            return;
        }

        const hubUrl = `${environment.apiUrl.replace(/\/api\/?$/, '')}/hubs/notification`;

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => localStorage.getItem('access_token') ?? '',
                withCredentials: false
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.on('NewOrder', (payload: NewOrderNotification) => {
            this.newOrderSubject.next(payload);
        });

        this.hubConnection.on('FoodQuantityChanged', (payload: FoodQuantityChangedNotification) => {
            this.foodQuantityChangedSubject.next(payload);
        });

        this.hubConnection.on('PromotionStatusChanged', (payload: PromotionStatusChangedNotification) => {
            this.promotionStatusChangedSubject.next(payload);
        });

        this.hubConnection.onreconnected(() => {
            this.isConnected.set(true);
            this.rejoinStoreGroup();
            this.rejoinPublicStoreGroup();
        });

        this.hubConnection.onclose(() => {
            this.isConnected.set(false);
        });

        this.hubConnection
            .start()
            .then(() => {
                this.isConnected.set(true);
                this.rejoinStoreGroup();
                this.rejoinPublicStoreGroup();
            })
            .catch(() => {
                this.isConnected.set(false);
            });
    }

    /** Group dành cho đại lý (chủ store) — cần đăng nhập, nhận cả thông báo đơn hàng mới. */
    joinStoreGroup(storeRefCode: string): void {
        this.joinedStoreRefCode = storeRefCode;
        this.rejoinStoreGroup();
    }

    /** Group công khai — dùng cho trang khách hàng (kể cả khách vãng lai) để nhận giá/tồn kho/KM realtime. */
    joinPublicStoreGroup(storeRefCode: string): void {
        this.joinedPublicStoreRefCode = storeRefCode;
        this.rejoinPublicStoreGroup();
    }

    disconnect(): void {
        this.joinedStoreRefCode = null;
        this.joinedPublicStoreRefCode = null;

        const connection = this.hubConnection;
        this.hubConnection = null;
        this.isConnected.set(false);

        connection?.stop();
    }

    private rejoinStoreGroup(): void {
        if (!this.joinedStoreRefCode) {
            return;
        }

        if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        this.hubConnection
            .invoke('JoinStoreGroup', this.joinedStoreRefCode)
            .catch(() => {});
    }

    private rejoinPublicStoreGroup(): void {
        if (!this.joinedPublicStoreRefCode) {
            return;
        }

        if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {
            return;
        }

        this.hubConnection
            .invoke('JoinPublicStoreGroup', this.joinedPublicStoreRefCode)
            .catch(() => {});
    }
}
