import { IRenderedTemplate } from './ITemplate';
import { ReportVisibility } from './ReportVisibility';

export interface IReport {
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
  translationsVerified: boolean;
  dataSourceID: string;
  dataSetID: string;
  dataView: string;
  visibility: ReportVisibility;
}
