import {Component, OnInit} from "@angular/core";
import {delay, finalize, firstValueFrom} from "rxjs";
import {AccountService, AccountUpdate} from "./account.service";
import {FormBuilder, Validators} from "@angular/forms";
import {HttpEventType} from "@angular/common/http";

@Component({
  template: `
    <app-title title="Account"></app-title>
    <ion-content>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-list class="field-list" *ngIf="loading; else loading">
          <ion-item>
            <ion-input label="Name" formControlName="fullName"></ion-input>
          </ion-item>

          <ion-item>
            <ion-input label="Email" formControlName="email"></ion-input>
          </ion-item>

          <ion-item>
            <ion-img [src]="avatarUrl"></ion-img>
            <ion-input
               label="Avatar"
               type="file"
               formControlName="avatar"
               accept="image/png, image/jpeg"
               (change)="onFileChanged($event)"></ion-input>
          </ion-item>

          <ion-item>
            <ion-toggle disabled [checked]="isAdmin">Administrator</ion-toggle>
          </ion-item>
        </ion-list>
        <ion-progress-bar *ngIf="uploading" [value]="uploadProgress"></ion-progress-bar>
        <ion-button *ngIf="form.valid && !uploading" (click)="submit()">Update</ion-button>
      </form>
      <ng-template #loading>
        <ion-spinner></ion-spinner>
      </ng-template>
    </ion-content>
  `,
  styleUrls: ['./form.css'],
})
export class AccountComponent implements OnInit {
  loading: boolean = true;
  uploading: boolean = false;
  uploadProgress: number | null = null;

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', Validators.required],
    avatar: [null as File | null],
  });
  avatarUrl: string | ArrayBuffer | null = null;
  isAdmin?: boolean;

  constructor(
    private readonly fb: FormBuilder,
    private readonly service: AccountService,
  ) {
  }

  async ngOnInit() {
    var account = await firstValueFrom(this.service.getCurrentUser());
    this.form.patchValue(account);
    this.avatarUrl = account.avatarUrl;
    this.isAdmin = account.isAdmin;
    this.loading = false;
  }

  onFileChanged($event: Event) {
    const files = ($event.target as HTMLInputElement).files;
    if (!files) return;
    this.form.patchValue({avatar: files[0]});
    this.form.controls.avatar.updateValueAndValidity();
    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.avatarUrl = reader.result;
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.uploading = true;
    this.service.update(this.form.value as AccountUpdate)
      .pipe(finalize(() => {
        this.uploading = false;
        this.uploadProgress = null;
      }))
      .subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / (event.total ?? 1)))
        } else if (event.type == HttpEventType.Response && event.body) {
          this.form.patchValue(event.body);
        }
      });
  }
}
