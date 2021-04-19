import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Response} from '../models/response';
import {LoginResponse} from '../models/loginresponse';
import {map, mergeMap} from 'rxjs/operators';
import {User} from '../models/user';

class LoginRequest {
  public email: string;
  public otp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public constructor(private readonly http: HttpClient) { }

  public logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('key');
    localStorage.removeItem('userId');
  }

  public isLoggedIn() {
    const result = localStorage.getItem('key');

    if(result === null || result === undefined) {
      return false;
    }

    return result.length > 0;
  }

  public getCurrentUser(): User {
    const json = localStorage.getItem('currentUser');

    if(json == null) {
      return null;
    }

    return JSON.parse(json);
  }

  public getApiKey() {
    if(!this.isLoggedIn()) {
      return '';
    }

    return localStorage.getItem('key');
  }

  public login(email: string, otp: string) {
    const url = `${environment.dsmrApiHost}/users/login`;
    const request: LoginRequest = {
      otp,
      email
    };

    return this.http.post<Response<LoginResponse>>(url, JSON.stringify(request))
      .pipe(mergeMap(response => {
        AuthenticationService.setLogin(response.data);
        return this.lookupCurrentUser();
      }), map(response => {
        AuthenticationService.setCurrentUser(response.data);
      }));
  }

  private lookupCurrentUser() {
    const url = `${environment.dsmrApiHost}/users`;
    return this.http.get<Response<User>>(url);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static setCurrentUser(user: User) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private static setLogin(login: LoginResponse) {
    localStorage.setItem('key', login.Token);
    localStorage.setItem('userId', login.UserId);
  }
}
