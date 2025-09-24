import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataViewModalComponent } from '../../components/data-view-modal/data-view-modal.component';
import { DataSource, DataView, PageMode } from '@adapt/types';
import { DataSourceModalComponent } from '../data-source-modal/data-source-modal.component';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'adapt-list-item-data',
  templateUrl: './list-item-data.component.html',
  styleUrls: ['./list-item-data.component.scss'],
})
export class ListItemDataComponent {
  PageMode = PageMode;
  @Input() view!: any;
  @Input() $reports!: any;
  @Input() $dataViews!: any;
  @Input() headingLvl: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' = 'h3';
  @Input() onLandingPage = false;
  @Input() dataViewModal!: DataViewModalComponent;
  @Input() dataSourceModal!: DataSourceModalComponent;
  @Input() reportModal!: ReportModalComponent;
  @Input() listType: 'sources' | 'views' | 'users' = 'views';

  handleSpaceInput(event: Event) {
    event.preventDefault();
    this.dataViewModal.open(this.view);
  }

  public onLearnMore(item: DataView | DataSource) {
    switch (this.listType) {
      case 'sources': {
        this.dataSourceModal.open(item as DataSource, PageMode.VIEW);
        break;
      }
      case 'views': {
        this.dataViewModal.open(item as DataView, true, 2);
        break;
      }
    }
  }
}
