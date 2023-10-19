import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, map } from "rxjs";
import { Post, PostsService } from "./posts.service";

@Component({
    template: `
      <app-title title="Posts"></app-title>
      <ion-content>
          <ion-grid [fixed]="true">
              <ion-row>
                  <ion-col *ngFor="let post of posts$ | async; index as i">
                      <ion-card [id]="'post_'+i" [routerLink]="[post.id]">
                          <ion-card-header>
                              <ion-card-title>{{post.title}}</ion-card-title>
                          </ion-card-header>
                          <ion-card-content>
                              {{post.content}}
                          </ion-card-content>
                      </ion-card>
                  </ion-col>
              </ion-row>
          </ion-grid>
      </ion-content>
  `
})
export class PostsComponent implements OnInit {
    posts$?: Observable<Post[]>;

    constructor(
        readonly router: Router,
        private readonly service: PostsService,
    ) { }

    ngOnInit(): void {
        this.posts$ = this.service.getPosts();
    }
}
