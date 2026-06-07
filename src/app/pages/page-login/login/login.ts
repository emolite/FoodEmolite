import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../common/services/auth.service';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

@Component({
  selector: 'app-page-login',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html'
})
export class PageLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  input = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = signal(false);

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  login(): void {
    this.errorMessage.set('');

    if (this.isLoading()) {
      return;
    }

    if (!this.input().trim() || !this.password()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    this.isLoading.set(true);

    this.authService.login({
      input: this.input().trim(),
      password: this.password()
    }).subscribe({
      next: response => {
        if (!response.isSuccess) {
          this.isLoading.set(false);
          this.errorMessage.set(response.message);
          return;
        }

        this.authService.verify().subscribe({
          next: verifyResponse => {
            this.isLoading.set(false);

            if (!verifyResponse.isSuccess || !verifyResponse.data) {
              this.errorMessage.set('Không lấy được thông tin tài khoản');
              return;
            }

            const role = verifyResponse.data.role;

            switch (role) {
              case 'Admin':
                this.router.navigateByUrl(URL_ENDPOINT.ADMIN);
                break;

              case 'Agent':
                this.router.navigateByUrl(URL_ENDPOINT.AGENT);
                break;

              default:
                this.router.navigateByUrl(URL_ENDPOINT.USER);
                break;
            }
          },
          error: () => {
            this.isLoading.set(false);
            this.errorMessage.set('Không lấy được thông tin tài khoản');
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Đăng nhập thất bại');
      }
    });
  }
}