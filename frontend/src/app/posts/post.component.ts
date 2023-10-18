import { Component, OnInit } from "@angular/core";
import { Post, data } from "./post.data";
import { Observable, of } from "rxjs";

@Component({
  template: `
      <ion-content>
          <ion-card *ngIf="post$ | async as post; else loading">
            <ion-card-header>
              <ion-card-title>
                  {{post.title}}
              </ion-card-title>
              <ion-card-subtitle>{{post.author?.fullName}}</ion-card-subtitle>
            </ion-card-header>
              <ion-card-content>{{post.content}}</ion-card-content>
          </ion-card>
          <ng-template #loading>
            <ion-spinner></ion-spinner>
          </ng-template>
      </ion-content>
  `
})
export class PostComponent implements OnInit {
  post$?: Observable<Post>;

  ngOnInit(): void {
    this.post$ = of(data);
  }
}
