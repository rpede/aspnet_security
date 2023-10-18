import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {UsersComponent} from './users.component';
import {RegisterComponent} from './register.component';
import {LoginComponent} from './login.component';
import {TabsComponent} from './tabs.component';
import {PostsComponent} from './posts.component';
import {PostComponent} from './post.component';
import {AccountComponent} from './account.component';
import {HomeComponent} from './home.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'posts',
        component: PostsComponent
      },
      {
        path: 'posts/:id',
        component: PostComponent
      },
      {
        path: 'account',
        component: AccountComponent
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'users',
        component: UsersComponent
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
