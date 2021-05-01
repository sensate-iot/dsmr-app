import { Injectable } from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AuthenticationService} from './authentication.service';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationHttpInterceptorService implements HttpInterceptor {
  public constructor(private readonly router: Router,
                     private readonly auth: AuthenticationService) { }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const key = this.auth.getApiKey();
    const headers = req.headers.append('X-ProductToken', key)
      .append('Content-Type', 'application/json');
    const clonedRequest = req.clone({ headers });

    return next.handle(clonedRequest).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse) {
        const err = error as HttpErrorResponse;

        switch(err.status) {
          case 401:
          case 403:
            this.auth.logout();
            this.router.navigate(['/login']).then();
            break;

          default:
            break;
        }
      }

      return throwError(error);
    }));
  }
}
