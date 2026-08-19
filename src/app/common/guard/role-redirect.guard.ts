import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { URL_ENDPOINT } from '../constants/url-endpoint';

/**
 * Route "" chỉ tồn tại để quyết định trang chủ theo role — không tự redirect cứng về
 * user/welcome nữa. Khách (chưa đăng nhập) vẫn vào welcome; tài khoản đã đăng nhập
 * (Admin/Agent/User) được đưa thẳng vào khu vực của họ.
 */
export const roleRedirectGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const welcomeUrlTree = router.createUrlTree([
        `/${URL_ENDPOINT.USER}/${URL_ENDPOINT.USER_STORES}`
    ]);

    if (!authService.token()) {
        return of(welcomeUrlTree);
    }

    return authService.verify().pipe(
        map(response => {
            const role = response.data?.role;

            switch (role) {
                case 'Admin':
                    return router.createUrlTree([`/${URL_ENDPOINT.ADMIN}`]);
                case 'Agent':
                    return router.createUrlTree([`/${URL_ENDPOINT.AGENT}`]);
                default:
                    return welcomeUrlTree;
            }
        }),
        catchError(() => of(welcomeUrlTree))
    );
};
