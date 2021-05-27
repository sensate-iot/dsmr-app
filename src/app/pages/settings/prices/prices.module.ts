import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PricesPageRoutingModule } from './prices-routing.module';
import { PricesPage } from './prices.page';
import {PriceRowModule} from "../../../components/price-row/price-row.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PricesPageRoutingModule,
    PriceRowModule
  ],
  declarations: [PricesPage]
})
export class PricesPageModule {}
