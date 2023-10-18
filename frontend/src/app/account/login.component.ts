import {Component} from "@angular/core";
import {FormBuilder, Validators} from "@angular/forms";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {environment} from "src/environments/environment";
import {firstValueFrom} from "rxjs";
import {ResponseDto} from "src/models";
import {ToastController} from "@ionic/angular";
import {TokenService} from "src/services/token.service";
import { Router } from "@angular/router";

@Component({
  template: `
      <app-title title="Login"></app-title>
      <ion-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
              <ion-list>

                  <ion-item>
                      <ion-input formControlName="email" data-testid="emailInput" placeholder="name@company.com"
                                 label-placement="floating">
                          <div slot="label">Email
                              <ion-text *ngIf="form.controls.password.touched && form.controls.email.invalid"
                                        color="danger">Valid
                                  email is required
                              </ion-text>
                          </div>
                      </ion-input>
                  </ion-item>

                  <ion-item>
                      <ion-input type="password" formControlName="password" data-testid="passwordInput"
                                 placeholder="****************" label-placement="floating">
                          <div slot="label">Password
                              <ion-text
                                      *ngIf="form.controls.password.touched && form.controls.password.errors?.['required']"
                                      color="danger">
                                  Required
                              </ion-text>
                          </div>
                      </ion-input>
                  </ion-item>

              </ion-list>

              <ion-button id="btn-submit" [disabled]="form.invalid" (click)="submit()">Submit</ion-button>
              <ion-button id="btn-register" color="secondary" fill="outline" [routerLink]="'/register'">Register
              </ion-button>
          </form>
      </ion-content>
  `,
  styleUrls: ['./form.css'],
})
export class LoginComponent {
  readonly form = this.fb.group({
    email: [null, [Validators.required, Validators.email]],
    password: [null, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly toast: ToastController,
    private readonly tokenService: TokenService
  ) {
  }

  async submit() {
    const url = '/api/account/login';
    var response = await firstValueFrom(this.http.post<{ token: string }>(url, this.form.value));
    this.tokenService.setToken(response.token);

    this.router.navigateByUrl('/home');

    (await this.toast.create({
      message: "Welcome back!",
      color: "success",
      duration: 5000
    })).present();
  }
}
