import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";
import { ToastController } from "@ionic/angular";
import { CustomValidators } from "../custom-validators";
import { AccountService, Registration } from "./account.service";

@Component({
  template: `
    <app-title title="Register"></app-title>
    <ion-content>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-list>

          <ion-item>
            <ion-input formControlName="fullName" data-testid="fullNameInput" placeholder="Your full name"
                       label-placement="floating">
              <div slot="label">Name
                <ion-text *ngIf="fullName.touched && fullName.invalid" color="danger">
                  Required
                </ion-text>
              </div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input formControlName="email" data-testid="emailInput" placeholder="Email (also used for login)"
                       label-placement="floating">
              <div slot="label">Email
                <ion-text *ngIf="email.touched && email.invalid" color="danger">Valid
                  email is required
                </ion-text>
              </div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input type="password" formControlName="password" data-testid="passwordInput"
                       placeholder="Type a hard to guess password" label-placement="floating">
              <div slot="label">Password
                <ion-text *ngIf="password.touched && password.errors?.['required']" color="danger">
                  Required
                </ion-text>
                <ion-text *ngIf="password.touched && password.errors?.['minlength']" color="danger">
                  Too short
                </ion-text>
              </div>
            </ion-input>
          </ion-item>

          <ion-item>
            <ion-input type="password" formControlName="passwordRepeat" data-testid="passwordRepeatInput"
                       placeholder="Repeat your password to make sure it was typed correct" label-placement="floating">
              <div slot="label">Password (again)
                <ion-text *ngIf="passwordRepeat.touched && passwordRepeat.errors?.['matchOther']" color="danger">
                  Must match the password
                </ion-text>
              </div>
            </ion-input>
          </ion-item>

        </ion-list>

        <ion-button id="btn-submit" [disabled]="form.invalid" (click)="submit()">Submit</ion-button>
      </form>
    </ion-content>
  `,
  styleUrls: ['./form.css'],
})
export class RegisterComponent {
  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    passwordRepeat: ['', [Validators.required, CustomValidators.matchOther('password')]],
    avatarUrl: [null],
  });

  get fullName() { return this.form.controls.fullName; }
  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password }
  get passwordRepeat() { return this.form.controls.passwordRepeat }
  get avatarUrl() { return this.form.controls.avatarUrl }

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: AccountService,
    private readonly toast: ToastController
  ) {
  }

  async submit() {
    if (this.form.invalid) return;
    await firstValueFrom(this.service.register(this.form.value as Registration));

    (await this.toast.create({
      message: "Thank you for signing up!",
      color: "success",
      duration: 5000
    })).present();
  }
}
