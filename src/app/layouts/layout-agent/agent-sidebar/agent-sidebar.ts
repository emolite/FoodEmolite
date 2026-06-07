import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../common/services/auth.service';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

@Component({
  selector: 'app-agent-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './agent-sidebar.html'
})
export class AgentSidebarComponent {
  readonly authService = inject(AuthService);
  readonly urlEndpoint = URL_ENDPOINT;

  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl(URL_ENDPOINT.LOGIN);
  }
}