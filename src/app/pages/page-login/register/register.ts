import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../common/services/auth.service';
import { URL_ENDPOINT } from '../../../common/constants/url-endpoint';

@Component({
  selector: 'app-page-register',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './register.html'
})
export class PageRegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  username = signal('');
  email = signal('');
  password = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);
  isCheckingEmail = signal(false);
  confirmPassword = signal('');
  checkEmail(): void {
    this.errorMessage.set('');

    if (!this.email()) {
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage.set('Email không đúng định dạng');
      return;
    }

    this.isCheckingEmail.set(true);

    this.authService.checkEmail(this.email()).subscribe({
      next: response => {
        this.isCheckingEmail.set(false);

        if (response.data) {
          this.errorMessage.set('Email đã tồn tại');
        }
      },
      error: () => {
        this.isCheckingEmail.set(false);
      }
    });
  }

  onEmailChange(value: string): void {
    this.email.set(value.trim());
    this.errorMessage.set('');
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email());
  }

  register(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.username() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Mật khẩu nhập lại không khớp');
      return;
    }

    if (!this.isEmailValid()) {
      this.errorMessage.set('Email không đúng định dạng');
      return;
    }

    this.isLoading.set(true);

    this.authService.register({
      username: this.username(),
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: response => {
        this.isLoading.set(false);

        if (!response.isSuccess) {
          this.errorMessage.set(response.message);
          return;
        }

        this.successMessage.set(response.data ?? 'Đăng ký thành công');

        setTimeout(() => {
          this.router.navigateByUrl(URL_ENDPOINT.LOGIN);
        }, 800);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Đăng ký thất bại');
      }
    });
  }
}