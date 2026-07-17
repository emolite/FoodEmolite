import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../common/services/auth.service';
import { ProfileService } from '../../../common/services/profile.service';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';
import { MyProfileResponse } from '../../../common/models/profile.model';

@Component({
  selector: 'app-agent-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './agent-sidebar.html'
})
export class AgentSidebarComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly urlEndpoint = URL_ENDPOINT;

  private readonly router = inject(Router);
  private readonly profileService = inject(ProfileService);

  profile = signal<MyProfileResponse | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getMyProfile().subscribe({
      next: response => {
        if (!response.isSuccess || !response.data) return;
        this.profile.set(response.data);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl(URL_ENDPOINT.LOGIN);
  }
}