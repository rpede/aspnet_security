import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ReactiveFormsModule } from "@angular/forms";

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { ErrorHttpInterceptor } from 'src/interceptors/error-http-interceptor';
import { TokenService } from 'src/services/token.service';
import { AuthHttpInterceptor } from 'src/interceptors/auth-http-interceptor';
import { NgModule } from '@angular/core';
import { TabsComponent } from './tabs.component';
import { HeaderComponent } from './header.component';
import { RegisterComponent } from './account/register.component';
import { LoginComponent } from './account/login.component';
import { AccountComponent } from './account/account.component';
import { PostsFeedComponent } from './posts/posts-feed.component';
import { HomeComponent } from './posts/home.component';
import { PostComponent } from './posts/post.component';
import { UsersComponent } from './admin/users.component';
import { AuthenticatedGuard } from './guards';
import { AccountService } from './account/account.service';
import { HomeService } from './posts/home.service';
import { PostsFeedService } from './posts/posts-feed.service';
import { PostService } from './posts/post.service';
import { GraphQLModule } from './graphql.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    TabsComponent,
    HomeComponent,
    PostsFeedComponent,
    PostComponent,
    UsersComponent,
    AccountComponent,
    RegisterComponent,
    LoginComponent,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ mode: 'ios' }),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    GraphQLModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorHttpInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
    TokenService,
    AuthenticatedGuard,
    AccountService,
    HomeService,
    PostsFeedService,
    PostService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
