import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OverviewPageRoutingModule } from './overview-routing.module';

import { OverviewPage } from './overview.page';
import {EnergyBarChartModule} from '../../../components/energy-bar-chart/energy-bar-chart.module';
import {InfoCardModule} from '../../../components/info-card/info-card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OverviewPageRoutingModule,
    EnergyBarChartModule,
    InfoCardModule
  ],
    declarations: [OverviewPage]
})
export class OverviewPageModule {}
