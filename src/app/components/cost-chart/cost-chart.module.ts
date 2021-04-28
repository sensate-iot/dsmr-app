import { NgModule } from '@angular/core';
import {CostChartComponent} from './cost-chart.component';
import {IonicModule} from '@ionic/angular';

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [CostChartComponent],
  exports: [CostChartComponent]
})
export class CostChartModule {}
