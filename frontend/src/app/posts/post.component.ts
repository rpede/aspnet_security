import {Component} from "@angular/core";
import * as Observable from "rxjs";

@Component({
  template: `
      <ion-content>
          <ion-card>
            <ion-card-header>
              <ion-card-title>
                  {{(post$ | async)?.title}}
              </ion-card-title>
              <ion-card-subtitle>{{(post$ | async)?.author?.fullName}}</ion-card-subtitle>
            </ion-card-header>
              <ion-card-content>{{(post$ | async)?.content}}</ion-card-content>
          </ion-card>
      </ion-content>
  `
})
export class PostComponent {
  post$ = Observable.of(
    {
      "id": 1,
      "author": {
        "id": 1,
        "fullName": "Joe Doe"
      },
      "title": "My First Post",
      "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Id neque aliquam vestibulum morbi. Auctor neque vitae tempus quam. Diam sit amet nisl suscipit adipiscing. Amet est placerat in egestas erat imperdiet sed euismod nisi. Neque vitae tempus quam pellentesque nec nam aliquam sem et. Malesuada fames ac turpis egestas sed tempus urna et. Velit laoreet id donec ultrices. Ante metus dictum at tempor commodo ullamcorper a lacus vestibulum. Dis parturient montes nascetur ridiculus. A condimentum vitae sapien pellentesque habitant morbi tristique senectus et. Egestas purus viverra accumsan in nisl nisi."
    }
  );
}
