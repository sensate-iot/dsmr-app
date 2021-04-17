import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss'],
})
export class InfoCardComponent implements OnInit {
  @Input() title: string;
  @Input() content: string;
  @Input() icon: string;

  public constructor() { }

  public ngOnInit() {}
}
