import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {Title} from "@angular/platform-browser";
import {TokenService} from "src/services/token.service";

@Component({
  selector: 'app-title',
  template: `
      <ion-header>
          <ion-toolbar>
              <ion-title>{{ titleText }}</ion-title>
              <ion-buttons slot="end">
                  <ion-button fill="solid" *ngIf="token.getToken(); else notLoggedIn" (click)="token.clearToken()">
                      Logout
                      <ion-icon slot="end" name="log-out"></ion-icon>
                  </ion-button>
                  <ng-template #notLoggedIn>
                      <ion-button fill="outline" [routerLink]="'/login'">
                          Login
                          <ion-icon slot="end" name="log-in"></ion-icon>
                      </ion-button>
                      <ion-button fill="solid" [routerLink]="'/register'">
                          Regiser
                      </ion-button>
                  </ng-template>
              </ion-buttons>
          </ion-toolbar>
      </ion-header>
  `
})
export class HeaderComponent implements OnChanges {
  @Input("title") titleText?: string;

  constructor(
    readonly token: TokenService,
    private readonly title: Title,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.title.setTitle(`Blog - ${this.titleText}`)
  }
}
