import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ToastController } from "@ionic/angular";
import { Observable } from "rxjs";
import { User } from "src/models";
import { TokenService } from "src/services/token.service";

@Component({
  template: `
    <ion-content style="position: absolute; top: 0;">
      <ion-button (click)="logout()">Logout</ion-button>
      <ion-list [inset]="true">
        <ion-item [id]="'card_'+user.id" *ngFor="let user of users$ | async">
          <ion-avatar slot="start">
            <img [src]="user.avatarUrl">
          </ion-avatar>
          <ion-label>
            <h2>{{user.fullName}}</h2>
            <p>Email: {{user.email}}</p>
          </ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  `
})
export class UsersComponent implements OnInit {
  users$?: Observable<User[]>;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private tokenService: TokenService,
  ) {

  }
  async fetchUsers() {
    this.users$ = this.http.get<User[]>('/api/users');
  }

  ngOnInit(): void {
    this.fetchUsers();
  }
  async logout() {
    this.tokenService.clearToken();

    (await this.toastController.create({
      message: 'Successfully logged out',
      duration: 5000,
      color: 'success',
    })).present()
  }
}

