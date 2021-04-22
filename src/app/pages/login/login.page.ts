import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public email: string;
  public password: string;

  public constructor(private readonly auth: AuthenticationService,
                     private readonly router: Router) { }

  public ngOnInit() {
    this.email = '';
    this.password = '';
  }

  public onOtpClicked() { }

  public onLoginClicked() {
    this.auth.login(this.email, this.password).subscribe(_ => {
      this.router.navigate(['/statistics/energy/overview']).then();
    });
  }
}
