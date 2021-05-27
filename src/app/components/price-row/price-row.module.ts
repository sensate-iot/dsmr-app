import { NgModule } from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {PriceRowComponent} from './price-row.component';

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [PriceRowComponent],
  exports: [PriceRowComponent]
})
export class PriceRowModule {}
