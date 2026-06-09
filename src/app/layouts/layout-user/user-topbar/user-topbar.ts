import {
  Component,
  HostListener,
  ElementRef,
  inject,
  signal
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../common/services/auth.service';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

@Component({
  selector: 'app-user-topbar',
  imports: [],
  templateUrl: './user-topbar.html'
})
export class UserTopbarComponent {
  readonly authService = inject(AuthService);
  readonly urlEndpoint = URL_ENDPOINT;

  private readonly router = inject(Router);
  private readonly el = inject(ElementRef<HTMLElement>);

  isUserMenuOpen = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.isUserMenuOpen.set(false);
    }
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isUserMenuOpen.set(!this.isUserMenuOpen());
  }

  goStores(): void {
    this.router.navigate([
      '/',
      URL_ENDPOINT.USER,
      URL_ENDPOINT.USER_STORES
    ]);
  }

  goHistory(): void {
    this.router.navigate([
      '/',
      URL_ENDPOINT.USER,
      URL_ENDPOINT.USER_HISTORY
    ]);
  }

  logout(): void {
    this.isUserMenuOpen.set(false);
    this.authService.logout();
    this.router.navigateByUrl(URL_ENDPOINT.LOGIN);
  }
}