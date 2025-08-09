import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cookie-banner-component',
    imports: [CommonModule],
    templateUrl: './cookie-banner-component.html',
    styleUrl: './cookie-banner-component.css'
})
export class CookieBannerComponent {
    cookieAccepted: boolean = false;
    showBanner: boolean = true;

    constructor() {
        // Initialise la valeur dans le localStorage si elle n'existe pas
        if (localStorage.getItem("cookie-choice") === null) {
            localStorage.setItem("cookie-choice", JSON.stringify(false));
        }
    }

    cookieOk() {
        this.cookieAccepted = true;
        this.saveChoiceCookie(this.cookieAccepted);
        this.hideBanner();
    }

    saveChoiceCookie(cookieAccepted: boolean) {
        localStorage.setItem("cookie-choice", JSON.stringify(cookieAccepted));
    }

    hideBanner() {
        this.showBanner = false;
    }
}