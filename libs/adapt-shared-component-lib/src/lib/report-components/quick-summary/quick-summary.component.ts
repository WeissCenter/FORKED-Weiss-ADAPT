import { PageContentText } from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
import { QuickSummary } from '@adapt/types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-adapt-quick-summary',
  templateUrl: './quick-summary.component.html',
  styleUrls: ['./quick-summary.component.scss'],
})
export class QuickSummaryComponent {
  @Input() report: any;

  @Input() content?: QuickSummary | any;
  @Input() cmsContent?: PageContentText | any;
}
