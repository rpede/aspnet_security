import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {ToastController} from '@ionic/angular';
import {TokenService} from 'src/services/token.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly token: TokenService,
    private readonly toast: ToastController,
  ) {
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const isAuthenticated = !!this.token.getToken();
    if (isAuthenticated) return true;
    (await this.toast.create({
      message: 'Login required!',
      color: 'danger', duration: 5000
    })).present();
    return this.router.parseUrl('/login');
  }
}
