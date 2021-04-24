import {AfterViewInit, Component, OnInit} from '@angular/core';
import {DsmrService} from '../../../services/dsmr.service';
import {AuthenticationService} from '../../../services/authentication.service';

@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.page.html',
  styleUrls: ['./monthly.page.scss'],
})
export class MonthlyPage implements OnInit {

  public constructor(private readonly dsmr: DsmrService,
                     private readonly auth: AuthenticationService) { }

  public ngOnInit() {
  }

  public refresh(event: any) {
  }
}
