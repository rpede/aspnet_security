import { Component, OnInit } from "@angular/core";
import { Observable, switchMap } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Post, PostService } from "./post.service";

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

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: PostService,
  ) { }

  ngOnInit(): void {
    this.post$ = this.route.params.pipe(switchMap(({ id }) =>
      this.service.getPost(Number.parseInt(id))
    ));
  }
}
