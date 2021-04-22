import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnergyPage } from './energy.page';
import {AuthGuard} from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: EnergyPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'overview',
        canActivate: [AuthGuard],
        loadChildren: () => import('../energy/overview/overview.module').then(m => m.OverviewPageModule)
      },
      {
        path: 'weekly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../energy/weekly/weekly.module').then(m => m.WeeklyPageModule)
      },
      {
        path: 'monthly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../energy/monthly/monthly.module').then(m => m.MonthlyPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnergyPageRoutingModule {}
