import {Component, OnInit} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {ModalController, ToastController} from "@ionic/angular";
import {firstValueFrom} from "rxjs";
import { State } from "src/state";
import { environment } from "src/environments/environment";
import { ResponseDto, User } from "src/models";

@Component({
  template: `
    <ion-content style="position: absolute; top: 0;">
      <ion-list [inset]="true">
        <ion-item [attr.data-testid]="'card_'+user.email" *ngFor="let user of state.users">
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

  constructor(
    public state: State,
    private http: HttpClient,
    private toastController: ToastController
  ) {

  }
  async fetchUsers() {
    const result = await firstValueFrom(this.http.get<ResponseDto<User[]>>('/api/users'))
    this.state.users = result.responseData!;
  }

  ngOnInit(): void {
    this.fetchUsers();
  }
}

