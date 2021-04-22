import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EnvironmentPage } from './environment.page';
import {AuthGuard} from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: EnvironmentPage,canActivate: [AuthGuard],
    children: [
      {
        path: 'overview',
        canActivate: [AuthGuard],
        loadChildren: () => import('../environment/overview/overview.module').then(m => m.OverviewPageModule)
      },
      {
        path: 'weekly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../environment/weekly/weekly.module').then(m => m.WeeklyPageModule)
      },
      {
        path: 'monthly',
        canActivate: [AuthGuard],
        loadChildren: () => import('../environment/monthly/monthly.module').then(m => m.MonthlyPageModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EnvironmentPageRoutingModule {}
