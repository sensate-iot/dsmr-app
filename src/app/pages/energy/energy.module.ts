import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EnergyPageRoutingModule } from './energy-routing.module';
import { EnergyPage } from './energy.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EnergyPageRoutingModule
  ],
  declarations: [EnergyPage]
})
export class EnergyPageModule {}
