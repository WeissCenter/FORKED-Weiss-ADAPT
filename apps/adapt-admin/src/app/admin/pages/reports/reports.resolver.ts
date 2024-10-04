import { IReport } from '@adapt/types';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { tap } from 'rxjs';

export const reportsResolver: ResolveFn<IReport[]> = (route, state, dataService = inject(AdaptDataService)) => {
  return dataService.getReports();
};
