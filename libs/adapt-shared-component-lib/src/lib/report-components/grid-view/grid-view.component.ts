import { ITemplatePage } from '@adapt/types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-adapt-grid-view',
  templateUrl: './grid-view.component.html',
  styleUrls: ['./grid-view.component.scss'],
})
export class GridViewComponent {
  @Input() report: any;

  @Input() content: any;
  @Input() page!: ITemplatePage;

  @Input() filters: any = {};

  @Input() suppressed = false;

  @Input() filtered = false;
  @Input() filterClass: 'filtered' | 'suppressed' = 'filtered';

  @Input() tabIndex?: number;
}
