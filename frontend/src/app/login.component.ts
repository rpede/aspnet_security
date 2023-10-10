import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { firstValueFrom } from "rxjs";
import { ResponseDto } from "src/models";
import { ToastController } from "@ionic/angular";

@Component({
  template: `
    <ion-content class="ion-padding" style="position: absolute; top: 0;">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-list>
          <ion-list-header>
            <ion-label>Login</ion-label>
          </ion-list-header>

          <ion-item>
            <ion-input formControlName="email" data-testid="emailInput" placeholder="name@company.com" label-placement="floating">
              <div slot="label">Email
                <ion-text *ngIf="form.controls.password.touched && form.controls.email.invalid" color="danger">Valid email is required</ion-text>
              </div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input type="password" formControlName="password" data-testid="passwordInput" placeholder="****************" label-placement="floating">
              <div slot="label">Password
                <ion-text *ngIf="form.controls.password.touched && form.controls.password.errors?.['required']" color="danger">
                  Required
                </ion-text>
              </div>
            </ion-input>
          </ion-item>

        </ion-list>

        <ion-button data-testid="submit" [disabled]="form.invalid" (click)="submit()">Submit</ion-button>
      </form>
    </ion-content>
  `
})
export class LoginComponent {
  readonly form = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private toast: ToastController ) { }

  async submit() {
    const url = '/api/account/login';
    var response = await firstValueFrom(this.http.post<ResponseDto<any>>(url, this.form.value));

    (await this.toast.create({
      message: response.messageToClient,
      color: "success",
      duration: 5000
    })).present();
  }
}
