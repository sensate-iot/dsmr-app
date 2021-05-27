import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportsPageRoutingModule } from './reports-routing.module';

import { ReportsPage } from './reports.page';
import {InfoCardModule} from '../../components/info-card/info-card.module';
import {EnergyBarChartModule} from '../../components/energy-bar-chart/energy-bar-chart.module';
import {CostChartModule} from '../../components/cost-chart/cost-chart.module';
import {GasChartModule} from '../../components/gas-chart/gas-chart.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReportsPageRoutingModule,
        InfoCardModule,
        EnergyBarChartModule,
        CostChartModule,
        GasChartModule
    ],
  declarations: [ReportsPage]
})
export class ReportsPageModule {}
