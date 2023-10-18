import {Component} from "@angular/core";
import {Router} from "@angular/router";
import * as Observable from "rxjs";

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
export class PostsComponent {
  posts$ = Observable.of([
    {
      "id": 1,
      "authorId": 2,
      "title": "My First Post",
      "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id neque aliquam vestibulum morbi. Auctor neque vitae tempus quam. Diam sit amet nisl suscipit adipiscing. Amet est placerat in egestas erat imperdiet sed euismod nisi. Neque vitae tempus quam pellentesque nec nam aliquam sem et. Malesuada fames ac turpis egestas sed tempus urna et. Velit laoreet id donec ultrices. Ante metus dictum at tempor commodo ullamcorper a lacus vestibulum. Dis parturient montes nascetur ridiculus. A condimentum vitae sapien pellentesque habitant morbi tristique senectus et. Egestas purus viverra accumsan in nisl nisi."
    },
    {
      "id": 2,
      "authorId": 2,
      "title": "Another post",
      "content": "Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Mattis ullamcorper velit sed ullamcorper morbi. Nec sagittis aliquam malesuada bibendum arcu vitae elementum. Enim nulla aliquet porttitor lacus. Massa sed elementum tempus egestas sed sed risus. Dignissim diam quis enim lobortis scelerisque fermentum. Magna sit amet purus gravida quis blandit turpis cursus. Semper viverra nam libero justo laoreet sit amet cursus sit. Maecenas pharetra convallis posuere morbi leo urna. Quis eleifend quam adipiscing vitae proin sagittis nisl rhoncus. At urna condimentum mattis pellentesque id nibh tortor. Pharetra vel turpis nunc eget. Est pellentesque elit ullamcorper dignissim. Rhoncus dolor purus non enim praesent elementum facilisis. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit."
    },
    {
      "id": 3,
      "authorId": 4,
      "title": "Motivation",
      "content": "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart."
    }
  ]);

  constructor(readonly router: Router) {
  }

}
