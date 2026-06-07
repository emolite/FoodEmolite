import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-agent-topbar',
  imports: [],
  templateUrl: './agent-topbar.html'
})
export class AgentTopbarComponent {
  private readonly router = inject(Router);

  title = signal('');

  constructor() {
    queueMicrotask(() => this.setHeader());

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.setHeader());
  }

  private setHeader(): void {
    let route = this.router.routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    this.title.set(route.snapshot.data?.['title'] ?? '');
  }
}