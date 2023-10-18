import {Component} from "@angular/core";
import * as Observable from "rxjs";

@Component({
  template: `
      <app-title [title]="'Home'"></app-title>

      <ion-toolbar>
          <ion-segment #segment value="uploads">
              <ion-segment-button *ngFor="let segment of segments$ | async" [value]="segment.value">
                  <ion-label>{{segment.label}}</ion-label>
              </ion-segment-button>
          </ion-segment>
      </ion-toolbar>

      <ion-content [ngSwitch]="segment.value">

          <ion-list *ngSwitchCase="'uploads'" [inset]="true">
              <ion-item [id]="'post_'+i" *ngFor="let post of posts$ | async; index as i"
                        [routerLink]="['/posts', post.id]">
                  <ion-label>
                      <h2>{{post.title}}</h2>
                      <p>{{post.content}}</p>
                  </ion-label>
              </ion-item>
          </ion-list>

          <ion-list *ngSwitchCase="'followers'" [inset]="true">
              <ion-item [id]="'follower_'+user.id" *ngFor="let user of followers$ | async">
                  <ion-avatar slot="start">
                      <img [src]="user.avatarUrl">
                  </ion-avatar>
                  <ion-label>
                      <h2>{{user.fullName}}</h2>
                  </ion-label>
              </ion-item>
          </ion-list>

          <ion-list *ngSwitchCase="'following'" [inset]="true">
              <ion-item [id]="'following_'+user.id" *ngFor="let user of following$ | async">
                  <ion-avatar slot="start">
                      <img [src]="user.avatarUrl">
                  </ion-avatar>
                  <ion-label>
                      <h2>{{user.fullName}}</h2>
                  </ion-label>
              </ion-item>
          </ion-list>

      </ion-content>
  `
})
export class HomeComponent {
  segments$ = Observable.of([
    {label: 'Uploads (2)', value: "uploads"},
    {label: 'Followers (3)', value: "followers"},
    {label: 'Following (1)', value: "following"},
  ]);
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
  ]);
  followers$ = Observable.of([
    {
      "id": 3,
      "fullName": "Dorie Lysaght",
      "avatarUrl": "https://robohash.org/eligendiquopossimus.png?size=50x50&set=set1"
    },
    {
      "id": 4,
      "fullName": "Jessey Burris",
      "avatarUrl": "https://robohash.org/estassumendamaiores.png?size=50x50&set=set1"
    },
    {
      "id": 5,
      "fullName": "Zacherie MacAughtrie",
      "avatarUrl": "https://robohash.org/natusetminus.png?size=50x50&set=set1"
    }
  ]);
  following$ = Observable.of([
    {
      "id": 3,
      "fullName": "Dorie Lysaght",
      "avatarUrl": "https://robohash.org/eligendiquopossimus.png?size=50x50&set=set1"
    }
  ]);
}
