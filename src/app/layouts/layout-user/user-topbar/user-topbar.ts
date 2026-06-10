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
import { UserProfilePopupComponent } from "../pop-up-user-profile/pop-up-user-profile";
import { ProfileService } from '../../../common/services/profile.service';

@Component({
  selector: 'app-user-topbar',
  imports: [UserProfilePopupComponent],
  templateUrl: './user-topbar.html'
})
export class UserTopbarComponent {
  readonly authService = inject(AuthService);
  readonly urlEndpoint = URL_ENDPOINT;

  private readonly router = inject(Router);
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly profileService = inject(ProfileService);

  isUserMenuOpen = signal(false);
  isProfilePopupOpen = signal(false);

  profileName = signal('');
  profileAvatar = signal('');

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getMyProfile().subscribe({
      next: res => {
        const profile = res.data?.profile;

        this.profileName.set(
          profile?.fullName ||
          this.authService.currentUser()?.username ||
          'User'
        );

        this.profileAvatar.set(profile?.avatarUrl || '');
      }
    });
  }

  get displayName(): string {
    return this.profileName() || this.authService.currentUser()?.username || 'User';
  }

  get avatarLetter(): string {
    return this.displayName.charAt(0).toUpperCase();
  }

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
    this.isUserMenuOpen.set(false);

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

  openProfilePopup(): void {
    this.isUserMenuOpen.set(false);
    this.isProfilePopupOpen.set(true);
  }

  closeProfilePopup(): void {
    this.isProfilePopupOpen.set(false);
    this.loadProfile();
  }
}