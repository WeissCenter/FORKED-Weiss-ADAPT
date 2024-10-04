import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdaptDataService } from '../../../services/adapt-data.service';
import { CreateReportInput, ISummaryTemplate, ITemplate } from '@adapt/types';
import { catchError, firstValueFrom, map, Observable, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../../../../../libs/adapt-shared-component-lib/src/lib/services/alert.service';
import { TemplateService } from '../../../services/template.service';

@Component({
  selector: 'adapt-create-report',
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.scss'],
})
export class CreateReportComponent {
  public createReportForm: FormGroup;

  public dataViewsList = this.dataService.getDataViews();

  public viewPreview = false;

  public previewValid = false;

  public previewSuppress = false;

  private _currentTemplate!: ITemplate | ISummaryTemplate | null;

  public templateDataViews: Observable<any>;

  public reportTemplates: Observable<{ label: string; value: string }[]>;

  constructor(
    private fb: FormBuilder,
    public dataService: AdaptDataService,
    public templateService: TemplateService,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertService
  ) {
    this.createReportForm = this.fb.group({
      name: this.fb.control('', { validators: [Validators.required] }),
      template: this.fb.control('', { validators: [Validators.required] }),
      dataSet: this.fb.control(window.history.state['dataSet'] || {}, { validators: [Validators.required] }),
      visibility: this.fb.control('external', { validators: [Validators.required] }),
      dataViews: this.fb.array([]),
    });

    this.reportTemplates = this.dataService
      .getTemplates<ITemplate>('ReportTemplate')
      .pipe(map((items) => items.map((item) => ({ label: item.title, value: item.id.replace('ID#', '') }))));

    this.templateDataViews = this.template!.valueChanges.pipe(
      switchMap((template) => this.templateService.getTemplate(template))
    ).pipe(
      map((tmp) => {
        const template = tmp as ITemplate;

        const views = [];

        if (template.pages?.length) {
          views.push(...template.pages.map((page) => page.name));
        }

        if (template.sections?.length) {
          views.push(template.title);
        }

        for (const view of views) {
          const control = this.fb.control('', [Validators.required]);
          this.dataViews.push(control);
        }

        return views;
      })
    );
  }

  public async createReport() {
    if (!this.createReportForm.valid) {
      return;
    }

    // name: string,
    // dataSourceID: string,
    // dataSetID: string,
    // template: IRenderedTemplate,
    // visibility: ReportVisibility

    const report = this.createReportForm.getRawValue();

    const dataSet = report.dataSet;

    const templateDef =
      this._currentTemplate || (await firstValueFrom(this.templateService.getTemplate(report.template)));

    // const template = await this.templateService.renderTemplate(templateDef as ITemplate,  dataSet.dataSetID)

    const newReportItem: CreateReportInput = {
      name: report.name,
      visibility: report.visibility,
      dataViews: report.dataViews,
      dataSetID: dataSet.dataSetID,
      dataSourceID: dataSet.dataSourceID,
      template: templateDef as any,
    };

    this.dataService
      .createReport(newReportItem)
      .pipe(
        catchError((err) => {
          throw this.alert.add({ type: 'error', title: 'Report Creation failed', body: err.error.err });
        })
      )
      .subscribe((result) => {
        this.router.navigate(['..', result], { relativeTo: this.route });
      });
  }

  public onTemplateUpdates(template: ITemplate | ISummaryTemplate | null) {
    this._currentTemplate = template;
  }

  public get name() {
    return this.createReportForm.get('name');
  }

  public get template() {
    return this.createReportForm.get('template');
  }

  public get external() {
    return this.createReportForm.get('external');
  }

  public get dataSet() {
    return this.createReportForm.get('dataSet');
  }

  public get dataViews() {
    return this.createReportForm.get('dataViews') as FormArray;
  }

  public get visibility() {
    return this.createReportForm.get('visibility');
  }

  // TODO: Create globally accessible version of this smooth scroll function

  toTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
