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
        path: 'generic/overview',
        canActivate: [AuthGuard],
        loadChildren: () => import('../generic/overview/overview.module').then( m => m.OverviewPageModule)
      },
      {
        path: 'generic/weekly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../generic/weekly/weekly.module').then( m => m.WeeklyPageModule)
      },
      {
        path: 'generic/monthly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../generic/monthly/monthly.module').then( m => m.MonthlyPageModule)
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
