import { DataViewModel } from './data-view.model';
import { IRenderedTemplate } from './ITemplate';
import { ReportVisibility } from './ReportVisibility';
import { DataSet } from './backend/DataSet';

export interface IReportPreview {
  dataView: DataViewModel;
  template: string;
  audience: string;
  title: string;
  description: string;
}
