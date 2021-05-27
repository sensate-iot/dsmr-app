import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AlertController} from '@ionic/angular';

@Component({
  selector: 'app-price-row',
  templateUrl: './price-row.component.html',
  styleUrls: ['./price-row.component.scss'],
})
export class PriceRowComponent implements OnInit {

  @Output() update: EventEmitter<number>;
  @Input() name: string;
  @Input() value: number;

  public constructor(private readonly alerts: AlertController) {
    this.update = new EventEmitter<number>();
  }

  public ngOnInit() {
  }

  public async onClick() {
    const alertElement = await this.alerts.create({
      header: 'Update',
      inputs: [
        {
          name: 'value',
          type: 'text',
          placeholder: `${this.name} price`
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: 'OK',
          handler: (result) => {
            this.update.emit(+result.value);
          }
        }
      ]
    });

    await alertElement.present();
  }
}
