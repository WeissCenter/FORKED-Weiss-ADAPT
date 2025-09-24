import { PageContentText } from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';
import { ITemplatePage } from '@adapt/types';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-adapt-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent {
  @Input() report: any;

  @Input() content: any;
  @Input() page!: ITemplatePage;
  @Input() lang = 'en';

  @Input() cmsContent?: PageContentText;

  @Input() filters: any = {};

  @Input() suppressed = false;

  @Input() filtered = false;
  @Input() filterClass: 'filtered' | 'suppressed' = 'filtered';

  @Input() tabIndex?: number;
  @Output() dataModalStateChange = new EventEmitter<boolean>();

  onDataModalStateChange(isOpen: boolean) {
    this.dataModalStateChange.emit(isOpen);
  }
}
