import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingsPage } from './settings.page';
import {AuthGuard} from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'prices',
        canActivate: [AuthGuard],
        loadChildren: () => import('../settings/prices/prices.module').then(m => m.PricesPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
