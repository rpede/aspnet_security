import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { AccountService, User } from "./account.service";

@Component({
  template: `
    <app-title title="Account"></app-title>
    <ion-content>
      <form>
        <ion-list class="field-list" *ngIf="account$ | async as account; else loading">
          <ion-item>
            <ion-input label="Name" [value]="account.fullName"></ion-input>
          </ion-item>

          <ion-item>
            <ion-input label="Email" [value]="account.email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-img [src]="account.avatarUrl"></ion-img>
            <ion-input label="Avatar URL" [value]="account.avatarUrl" [readonly]="true"></ion-input>
          </ion-item>

          <ion-item>
            <ion-toggle [checked]="account.isAdmin">Administrator</ion-toggle>
          </ion-item>
        </ion-list>
        <ion-button>Update</ion-button>
      </form>
      <ng-template #loading>
        <ion-spinner></ion-spinner>
      </ng-template>
    </ion-content>
  `,
  styleUrls: ['./form.css'],
})
export class AccountComponent implements OnInit {
  account$?: Observable<User>;

  constructor(private readonly service: AccountService) { }

  ngOnInit(): void {
    this.account$ = this.service.getCurrentUser();
  }
}
