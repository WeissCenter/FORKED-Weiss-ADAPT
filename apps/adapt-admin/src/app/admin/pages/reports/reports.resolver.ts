import { IReportModel } from '@adapt/types';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AdaptReportService } from '@adapt-apps/adapt-admin/src/app/services/adapt-report.service';

export const reportsResolver: ResolveFn<IReportModel[]> = (route, state, adaptReportService = inject(AdaptReportService)) => {
  return adaptReportService.getReportsListener();
};
