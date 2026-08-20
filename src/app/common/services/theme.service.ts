import { Injectable, signal } from '@angular/core';

export type UserTheme = 'dark' | 'light';

const STORAGE_KEY = 'user_theme';

/**
 * Theme (sáng/tối) riêng cho khu vực khách hàng (page-user). Chế độ tối giữ
 * nguyên thiết kế hiện tại; chế độ sáng được áp qua CSS scoped ở styles.css
 * (selector .user-theme-scope[data-theme="light"]) — không đổi class trong
 * template, nên dark mode không bị ảnh hưởng.
 */
@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    readonly theme = signal<UserTheme>(this.readStored());

    toggle(): void {
        this.set(this.theme() === 'dark' ? 'light' : 'dark');
    }

    set(theme: UserTheme): void {
        this.theme.set(theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }

    private readStored(): UserTheme {
        return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
    }
}
