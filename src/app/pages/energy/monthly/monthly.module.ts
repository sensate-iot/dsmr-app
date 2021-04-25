import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MonthlyPageRoutingModule } from './monthly-routing.module';

import { MonthlyPage } from './monthly.page';
import {OverviewPageModule} from "../overview/overview.module";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        MonthlyPageRoutingModule,
        OverviewPageModule
    ],
  declarations: [MonthlyPage]
})
export class MonthlyPageModule {}
