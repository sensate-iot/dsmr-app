import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationHttpInterceptorService implements HttpInterceptor {
  public constructor() { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //const key = 'B9E706AA-EFD6-45ED-9C7E-236ADE0B56BA';
    const key = 'FE52C7F6-1ADE-4F11-B276-431DD484FDED';
    const clonedRequest = req.clone({ headers: req.headers.append('X-ProductToken', key) });

    return next.handle(clonedRequest);
  }
}
