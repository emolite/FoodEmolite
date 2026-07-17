import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthService } from './common/services/auth.service';

import { ToastComponent } from './shared/component/toast/toast';
import { GuestService } from './common/services/guest.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('food-emolite');

  private readonly authService = inject(AuthService);
  private readonly guestService = inject(GuestService);

  ngOnInit(): void {
    this.authService.verifyOnRefresh().subscribe();
    this.guestService.initialize().subscribe();
  }
}