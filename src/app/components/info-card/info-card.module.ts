import { NgModule } from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {InfoCardComponent} from './info-card.component';

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [InfoCardComponent],
  exports: [InfoCardComponent]
})
export class InfoCardModule {}
