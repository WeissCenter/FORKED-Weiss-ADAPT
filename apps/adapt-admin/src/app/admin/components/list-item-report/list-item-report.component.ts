import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';

@Component({
  selector: 'adapt-list-item-report',
  templateUrl: './list-item-report.component.html',
  styleUrls: ['./list-item-report.component.scss'],
})
export class ListItemReportComponent {
  // TODO: Ask about the IReport interface and where "description" is meant to live as it appears to be part of the ITemplate type
  @Input() report!: any;
  @Input() headingLvl: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h3';
  @Input() onLandingPage = false;

  @Output() unPublish = new EventEmitter();
  @Output() publish = new EventEmitter();
  get navPath() {
    return this.onLandingPage ? [this.report.reportID] : 'reports/' + [this.report.reportID];
  }

  constructor(private data: AdaptDataService, private alert: AlertService) {}

  public publishReport() {
    this.publish.emit();
  }
}
