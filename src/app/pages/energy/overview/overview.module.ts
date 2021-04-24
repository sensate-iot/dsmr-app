import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OverviewPageRoutingModule } from './overview-routing.module';

import { OverviewPage } from './overview.page';
import {InfoCardComponent} from "../../../components/info-card/info-card.component";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OverviewPageRoutingModule
    ],
    exports: [
        InfoCardComponent
    ],
    declarations: [OverviewPage, InfoCardComponent]
})
export class OverviewPageModule {}
