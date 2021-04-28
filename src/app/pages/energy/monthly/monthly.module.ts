import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonthlyPageRoutingModule } from './monthly-routing.module';

import { MonthlyPage } from './monthly.page';
import {InfoCardComponent} from '../../../components/info-card/info-card.component';
import {CostChartModule} from '../../../components/cost-chart/cost-chart.module';
import {EnergyBarChartModule} from "../../../components/energy-bar-chart/energy-bar-chart.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MonthlyPageRoutingModule,
    CostChartModule,
    EnergyBarChartModule
  ],
  declarations: [MonthlyPage, InfoCardComponent]
})
export class MonthlyPageModule {}
