import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.page.html',
  styleUrls: ['./energy.page.scss'],
})
export class EnergyPage implements OnInit {
  public constructor(private readonly router: Router) {
    if(this.router.url === '/' || this.router.url === '/energy') {
      this.router.navigate(['/energy/overview']).then();
    }
  }

  public ngOnInit() {
  }
}
