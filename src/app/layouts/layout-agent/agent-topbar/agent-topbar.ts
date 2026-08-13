import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { RealtimeService } from '../../../common/services/realtime.service';
import { NotificationSoundService } from '../../../common/services/notification-sound.service';
import { NewOrderNotification } from '../../../common/models/realtime.model';

interface AgentOrderNotificationItem extends NewOrderNotification {
  id: string;
  read: boolean;
}

@Component({
  selector: 'app-agent-topbar',
  imports: [],
  templateUrl: './agent-topbar.html'
})
export class AgentTopbarComponent {
  private readonly router = inject(Router);
  private readonly realtimeService = inject(RealtimeService);
  private readonly notificationSoundService = inject(NotificationSoundService);

  title = signal('');

  notifications = signal<AgentOrderNotificationItem[]>([]);
  isNotificationsOpen = signal(false);

  constructor() {
    queueMicrotask(() => this.setHeader());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.setHeader());

    this.realtimeService.newOrder$.pipe(takeUntilDestroyed()).subscribe(notification => {
      const item: AgentOrderNotificationItem = {
        ...notification,
        id: `${notification.orderId}-${Date.now()}`,
        read: false
      };

      this.notifications.update(list => [item, ...list].slice(0, 20));
      this.notificationSoundService.playNewOrder();
    });
  }

  unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update(value => !value);

    if (this.isNotificationsOpen()) {
      this.notifications.update(list => list.map(n => ({ ...n, read: true })));
    }
  }

  formatCurrency(value: number): string {
    return `${value.toLocaleString('vi-VN')}đ`;
  }

  formatTime(value: string): string {
    return new Date(value).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private setHeader(): void {
    let route = this.router.routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.title.set(route.snapshot.data?.['title'] ?? '');
  }
}