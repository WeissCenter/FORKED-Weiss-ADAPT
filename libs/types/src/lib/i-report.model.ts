import { IRenderedTemplate } from './ITemplate';
import { ReportVisibility } from './ReportVisibility';

export interface IReportModel {
  published: string;
  slug: string;
  reportID: string;
  lang?: string;
  name: string;
  updated: string;
  template: IRenderedTemplate;
  author: string;
  approval: string;
  version: string;
  status?: string;  // used for showing the pubish status on draft reports
  translationsVerified: boolean;
  dataSourceID: string;
  dataSetID: string;
  dataView: string;
  visibility: ReportVisibility;
}

export enum REPORT_PUBLISH_STATUS {
  REQUESTED = 'requested',
  UNPUBLISHED = 'unpublished',
  PROCESSING = 'processing',
  FAILED = 'failed',
  PUBLISHED = 'published',
}

export interface ReportFilterCriteriaModel {
  search: string;
  version: string[];
  visibility: string[];
}
