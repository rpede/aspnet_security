import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from 'src/environments/environment';

@Injectable()
export class RewriteHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    if (req.url.startsWith('/')) {
      // Rewrite relative URLs to start with baseUrl from src/environments/environment
      return next.handle(req.clone({url: environment.baseUrl + req.url}));
    }
    return next.handle(req);
  }
}
