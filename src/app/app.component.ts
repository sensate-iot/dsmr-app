import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from './services/authentication.service';
import {Router} from '@angular/router';
import {
  ArcElement,
  BarController,
  BarElement, CategoryScale,
  Chart,
  DoughnutController, Legend, LinearScale,
  LineController,
  LineElement,
  PointElement, Title
} from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Energy', url: '/energy/overview', icon: 'stats-chart' },
    { title: 'Environment', url: '/environment/overview', icon: 'rainy' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];

  public name: string;

  public constructor(private readonly auth: AuthenticationService,
                     private readonly router: Router) {

    Chart.register(LineController, BarController,
      PointElement,
      BarElement,
      DoughnutController,
      ArcElement,
      LineElement,
      Legend,
      CategoryScale, LinearScale, Title);
  }

  public ngOnInit(): void {
    const user = this.auth.getCurrentUser();

    if(user == null) {
      return;
    }

    this.name = `${user.firstName} ${user.lastName}`;
  }

  public onLogoutClicked() {
    this.auth.logout();
    this.router.navigate(['/login']).then();
  }
}
