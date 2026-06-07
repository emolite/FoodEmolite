import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserTopbarComponent } from "./user-topbar/user-topbar";

@Component({
  selector: 'app-layout-user',
  imports: [
    RouterOutlet,
    UserTopbarComponent
],
  templateUrl: './layout-user.html'
})
export class LayoutUserComponent {}