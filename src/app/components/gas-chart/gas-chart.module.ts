import { NgModule } from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {GasChartComponent} from './gas-chart.component';

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [GasChartComponent],
  exports: [GasChartComponent]
})
export class GasChartModule {}
