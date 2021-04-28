import { NgModule } from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {EnergyBarChartComponent} from './energy-bar-chart.component';

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [EnergyBarChartComponent],
  exports: [EnergyBarChartComponent]
})
export class EnergyBarChartModule {}
