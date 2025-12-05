import { DataSet, DataSource, ISummaryTemplate } from '@adapt/types';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, map, catchError } from 'rxjs';
import { ModalComponent } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/components/modal/modal.component';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { RoleService } from '../../../auth/services/role/role.service';
import { NotificationsService } from '../../../services/notifications.service';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { TemplateService } from '../../../services/template.service';
import { AdaptDataViewService } from '@adapt-apps/adapt-admin/src/app/services/adapt-data-view.service';

@Component({
  selector: 'adapt-data-sets',
  standalone: false,
  templateUrl: './data-sets.component.html',
  styleUrls: ['./data-sets.component.scss'],
})
export class DataSetsComponent {
  Math = Math;

  @ViewChild('modal') modal?: ModalComponent;

  public page = 1;
  public query = '';
  public maxPages = 1;
  public pageSize = 5;

  public selectedDataSet?: DataSet;
  public selectedDataSetParentSource?: Observable<DataSource>;
  public selectedDataSetData?: Observable<ISummaryTemplate>;
  public selectedDataSetDataTotalRows?: Promise<number>;
  public selectedDataSetTotals?: Observable<number>;

  public dataList: Observable<DataSet[]> = this.route.queryParams.pipe(
    switchMap((params) => {
      this.query = params['search'] || '';
      this.page = parseInt(params['page'] || '1');

      return this.data.getDataSets().pipe(
        map((data) =>
          data.filter((item: DataSet) => {
            const searchMatch = !this.query.length || item.name.toLowerCase().includes(this.query);

            return searchMatch;
          })
        )
      );
    })
  );

  constructor(
    private route: ActivatedRoute,
    public data: AdaptDataService,
    private adaptDataViewService: AdaptDataViewService,
    public role: RoleService,
    private alert: AlertService
  ) {}

  public startDataPull(dataSet?: DataSet) {
    if (!dataSet) {
      return;
    }
    this.modal?.close();
    this.adaptDataViewService.doDataPull(dataSet.dataSetID).pipe(
        catchError((err) => {
          this.alert.add({
            type: 'error',
            title: 'Data Save Error',
            body: `Data Save for ${dataSet.name} failed to start: ${err}`,
          });
          return err;
        })
      )
      .subscribe(() => {
        this.alert.add({
          type: 'success',
          title: 'Data Save Started',
          body: `Data Save for ${dataSet.name} started. You will receive a notification when the save is complete.`,
        });
      });
  }

  public showDataSummary(dataset: DataSet) {
    this.selectedDataSet = dataset;

    if (dataset.summaryTemplate) {
      // this.selectedDataSetData = this.template.getTemplate(dataset.summaryTemplate).pipe(switchMap(template => this.template.renderSummaryTemplate(template as ISummaryTemplate, dataset.dataSetID)))
    }

    this.selectedDataSetDataTotalRows = this.data
      .getDataFromDataViewPromise(dataset.dataSetID, '', [
        {
          id: 'count',
          function: 'COUNT',
          arguments: [
            {
              field: '*',
            },
          ],
        },
      ])
      .then((result) => result.operationResults[0].value);

    this.modal?.open();
  }
}
