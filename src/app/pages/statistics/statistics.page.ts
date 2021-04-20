import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnInit {

  public constructor(private readonly router: Router) {
    if(this.router.url === '/' || this.router.url === '/statistics') {
      this.router.navigate(['/statistics/generic/overview']).then();
    }
  }

  public ngOnInit() {
  }

}
