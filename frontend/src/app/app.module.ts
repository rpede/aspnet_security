import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';
import {ReactiveFormsModule} from "@angular/forms";

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {UsersComponent} from './users.component';
import {RegisterComponent} from './register.component';
import {LoginComponent} from './login.component';
import {ErrorHttpInterceptor} from 'src/interceptors/error-http-interceptor';
import {TokenService} from 'src/services/token.service';
import {AuthHttpInterceptor} from 'src/interceptors/auth-http-interceptor';
import {NgModule} from '@angular/core';
import {TabsComponent} from './tabs.component';
import {HeaderComponent} from './header.component';
import {PostsComponent} from './posts.component';
import {PostComponent} from './post.component';
import {AccountComponent} from './account.component';
import {HomeComponent} from './home.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TabsComponent,
    HomeComponent,
    PostsComponent,
    PostComponent,
    AccountComponent,
    UsersComponent,
    RegisterComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot({mode: 'ios'}),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorHttpInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true},
    TokenService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
