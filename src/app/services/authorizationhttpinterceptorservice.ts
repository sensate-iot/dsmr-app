import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationHttpInterceptorService implements HttpInterceptor {
  public constructor(private readonly auth: AuthenticationService) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const key = this.auth.getApiKey();
    const headers = req.headers.append('X-ProductToken', key)
      .append('Content-Type', 'application/json');
    const clonedRequest = req.clone({ headers });

    return next.handle(clonedRequest);
  }
}
