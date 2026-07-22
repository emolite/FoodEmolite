import { Component } from '@angular/core';

@Component({
    selector: 'app-user-footer',
    imports: [],
    templateUrl: './user-footer.html'
})
export class UserFooterComponent {
    readonly ownerName = 'Vũ Quốc Bảo';
    readonly nickname = 'Emolite';
    readonly phoneNumber = '0362488116';
    readonly address = '493/130/21 - Kp22, P. Long Bình, Tp. Đồng Nai';
    readonly musicSiteUrl = 'https://emolite.id.vn/users/home';
    readonly facebookUrl = 'https://www.facebook.com/bao.vu.825261/';
    readonly youtubeUrl = 'https://www.youtube.com/@QBao2005';
    readonly tiktokUrl = 'https://www.tiktok.com/@amlwaifuraidenei';

    readonly donationQrUrl =
        'https://img.vietqr.io/image/VCB-1060259437-qr_only.png?accountName=VU%20QUOC%20BAO';

    currentYear = new Date().getFullYear();
}
