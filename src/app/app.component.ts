import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Generic', url: '/statistics/generic/overview', icon: 'stats-chart' },
    { title: 'Power', url: '/statistics/power/overview', icon: 'flash' },
    { title: 'Environment', url: '/statistics/environment/overview', icon: 'rainy' },
    { title: 'Settings', url: '/settings/general', icon: 'settings' },
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor() {}
}
