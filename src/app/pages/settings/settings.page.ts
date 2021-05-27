import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  public constructor(router: Router) {
    if(router.url === '/' || router.url === '/settings') {
      router.navigate(['/settings/prices']).then();
    }
  }

  public ngOnInit() {
  }
}
