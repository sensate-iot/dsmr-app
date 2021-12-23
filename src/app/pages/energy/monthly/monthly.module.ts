import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonthlyPageRoutingModule } from './monthly-routing.module';

import { MonthlyPage } from './monthly.page';
import {CostChartModule} from '../../../components/cost-chart/cost-chart.module';
import {EnergyBarChartModule} from '../../../components/energy-bar-chart/energy-bar-chart.module';
import {InfoCardModule} from '../../../components/info-card/info-card.module';
import {GasChartModule} from '../../../components/gas-chart/gas-chart.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MonthlyPageRoutingModule,
        CostChartModule,
        EnergyBarChartModule,
        InfoCardModule,
        GasChartModule
    ],
  declarations: [MonthlyPage]
})
export class MonthlyPageModule {}
