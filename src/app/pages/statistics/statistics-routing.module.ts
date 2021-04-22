import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatisticsPage } from './statistics.page';
import {AuthGuard} from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: 'statistics',
    component: StatisticsPage,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'energy/overview',
        canActivate: [AuthGuard],
        loadChildren: () => import('../energy/overview/overview.module').then(m => m.OverviewPageModule)
      },
      {
        path: 'energy/weekly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../energy/weekly/weekly.module').then(m => m.WeeklyPageModule)
      },
      {
        path: 'energy/monthly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../energy/monthly/monthly.module').then(m => m.MonthlyPageModule)
      },
      {
        path: 'environment/overview',
        canActivate: [AuthGuard],
        loadChildren: () => import('../environment/overview/overview.module').then(m => m.OverviewPageModule)
      },
      {
        path: 'environment/weekly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../environment/weekly/weekly.module').then(m => m.WeeklyPageModule)
      },
      {
        path: 'environment/monthly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../environment/monthly/monthly.module').then(m => m.MonthlyPageModule)
      }
    ]
  },
  {
    path: '',
    component: StatisticsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatisticsPageRoutingModule {}
