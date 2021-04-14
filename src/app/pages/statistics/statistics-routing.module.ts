import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StatisticsPage } from './statistics.page';

const routes: Routes = [
  {
    path: 'statistics',
    component: StatisticsPage,
    children: [
      {
        path: 'generic/overview',
        loadChildren: () => import('../generic/overview/overview.module').then( m => m.OverviewPageModule)
      },
      {
        path: 'generic/weekly',
        loadChildren: () => import('../generic/weekly/weekly.module').then( m => m.WeeklyPageModule)
      },
      {
        path: 'generic/monthly',
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
