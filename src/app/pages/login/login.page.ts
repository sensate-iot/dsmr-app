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
  public email: string;
  public password: string;

  public constructor(private readonly auth: AuthenticationService,
                     private readonly router: Router,
                     private readonly toast: ToastController) { }

  public ngOnInit() {
    this.email = '';
    this.password = '';
  }

  public onOtpClicked() { }

  public onLoginClicked() {
    this.auth.login(this.email, this.password).subscribe(_ => {
      this.router.navigate(['/energy/overview']).then();
    }, _ => {
      this.toast.create({
        message: 'Unable to login.',
        duration: 2000,
        position: 'bottom'
      }).then(result => {
        result.present().then();
      });
    });
  }
}
