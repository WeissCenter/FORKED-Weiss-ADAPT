import { DataSet, DataSource } from '@adapt/types';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { Observable, tap } from 'rxjs';
import { RecentActivityService } from '../../../services/recent-activity.service';

export const dataSetResolver: ResolveFn<Observable<DataSet>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  dataService: AdaptDataService = inject(AdaptDataService),
  recentActivity = inject(RecentActivityService)
) => {
  return dataService
    .getDataSet(route.params['dataSetID'])
    .pipe(tap((result) => recentActivity.addRecentActivity(route.params['dataSetID'], 'DataView', result)));
};
