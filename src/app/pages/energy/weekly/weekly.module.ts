import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WeeklyPageRoutingModule } from './weekly-routing.module';
import { WeeklyPage } from './weekly.page';
import {CostChartModule} from '../../../components/cost-chart/cost-chart.module';
import {EnergyBarChartModule} from '../../../components/energy-bar-chart/energy-bar-chart.module';
import {InfoCardModule} from '../../../components/info-card/info-card.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeeklyPageRoutingModule,
    CostChartModule,
    EnergyBarChartModule,
    InfoCardModule
  ],
  declarations: [WeeklyPage]
})
export class WeeklyPageModule {}
