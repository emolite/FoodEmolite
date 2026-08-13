import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentSidebarComponent } from './agent-sidebar/agent-sidebar';
import { AgentTopbarComponent } from './agent-topbar/agent-topbar';
import { ProfileService } from '../../common/services/profile.service';
import { RealtimeService } from '../../common/services/realtime.service';

@Component({
  selector: 'app-layout-agent',
  imports: [
    RouterOutlet,
    AgentSidebarComponent,
    AgentTopbarComponent
  ],
  templateUrl: './layout-agent.html'
})
export class LayoutAgentComponent implements OnInit, OnDestroy {
  private readonly profileService = inject(ProfileService);
  private readonly realtimeService = inject(RealtimeService);

  ngOnInit(): void {
    this.realtimeService.connect();

    this.profileService.getMyProfile().subscribe(response => {
      const storeRefCode = response.data?.store?.refCode;

      if (response.isSuccess && storeRefCode) {
        this.realtimeService.joinStoreGroup(storeRefCode);
      }
    });
  }

  ngOnDestroy(): void {
    this.realtimeService.disconnect();
  }
}