import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AgentSidebarComponent } from './agent-sidebar/agent-sidebar';
import { AgentTopbarComponent } from './agent-topbar/agent-topbar';

@Component({
  selector: 'app-layout-agent',
  imports: [
    RouterOutlet,
    AgentSidebarComponent,
    AgentTopbarComponent
  ],
  templateUrl: './layout-agent.html'
})
export class LayoutAgentComponent {}