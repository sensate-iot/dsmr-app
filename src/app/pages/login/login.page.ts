import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {Router} from '@angular/router';
import {ToastController} from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private static emailRegex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

  public email: string;
  public password: string;

  public constructor(private readonly auth: AuthenticationService,
                     private readonly router: Router,
                     private readonly toast: ToastController) { }

  public ngOnInit() {
    this.email = '';
    this.password = '';
  }

  public onOtpClicked() {
    if(this.email.length <= 0) {
      this.createToast('Email required.', 2000);
      return;
    }

    this.auth.requestOtp(this.email).subscribe(() => {
      this.createToast('OTP code requested.', 2000);
    }, _ => {
      this.createToast('Unable to request OTP.', 2000);
    });
  }

  public onLoginClicked() {
    this.auth.login(this.email, this.password).subscribe(_ => {
      this.router.navigate(['/energy/overview']).then();
    }, _ => {
      this.createToast('Unable to login.', 2000);
    });
  }

  public emailIsValid() {
    return LoginPage.emailRegex.test(this.email);
  }

  private createToast(msg: string, duration: number) {
    this.toast.create({
      message: msg,
      duration,
      position: 'bottom'
    }).then(result => {
      result.present().then();
    });
  }
}
