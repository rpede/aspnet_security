import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CustomValidators } from "./custom-validators";
import {firstValueFrom} from "rxjs";
import { environment } from "src/environments/environment";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ToastController} from "@ionic/angular";
import { ResponseDto } from "src/models";

@Component({
  template: `
    <ion-content class="ion-padding" style="position: absolute; top: 0;">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-list>
          <ion-list-header>
            <ion-label>Register</ion-label>
          </ion-list-header>
          <ion-item>
            <ion-input formControlName="fullName" data-testid="fullNameInput" placeholder="Your full name" label-placement="floating">
              <div slot="label">Name <ion-text *ngIf="form.controls.password.touched && form.controls.fullName.invalid" color="danger">Required</ion-text></div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input formControlName="email" data-testid="emailInput" placeholder="Email (also used for login)" label-placement="floating">
              <div slot="label">Email
                <ion-text *ngIf="form.controls.password.touched && form.controls.email.invalid" color="danger">Valid email is required</ion-text>
              </div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input type="password" formControlName="password" data-testid="passwordInput" placeholder="Type a hard to guess password" label-placement="floating">
              <div slot="label">Password
                <ion-text *ngIf="form.controls.password.touched && form.controls.password.errors?.['required']" color="danger">
                  Required
                </ion-text>
                <ion-text *ngIf="form.controls.password.touched && form.controls.password.errors?.['minlength']" color="danger">
                  Too short
                </ion-text>
              </div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input type="password" formControlName="passwordRepeat"  data-testid="passwordRepeatInput" placeholder="Repeat your password to make sure it was typed correct" label-placement="floating">
              <div slot="label">Password (again)
                <ion-text *ngIf="form.controls.password.touched && form.controls.passwordRepeat.errors?.['matchOther']" color="danger">
                  Must match the password
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
export class RegisterComponent {
  readonly form = this.fb.group({
    fullName: [null, Validators.required],
    email: [null, [Validators.required, Validators.email]],
    password: [null, [Validators.required, Validators.minLength(8)]],
    passwordRepeat: [null, [Validators.required, CustomValidators.matchOther('password')]],
    avatarUrl: [null],
  });

  constructor(private fb: FormBuilder, private http: HttpClient, private toast: ToastController ) { }

  async submit() {
    const url = '/api/account/register';
    try {
      var response = await firstValueFrom(this.http.post<ResponseDto<any>>(url, this.form.value));

      (await this.toast.create({
        message: response.messageToClient,
        color: "success",
        duration: 5000
      })).present();
    } catch (e) {
      (await this.toast.create({
        message: (e as HttpErrorResponse).error.messageToClient,
        color: "danger",
        duration: 5000
      })).present();
    }
  }
}
