import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { HomeComponent } from './pages/home/home.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { CreateReportComponent } from './pages/create-report/create-report.component';
import { DataComponent } from './pages/data/data.component';
import { reportsResolver } from './pages/reports/reports.resolver';
import { UploadDataComponent } from './pages/upload-data/upload-data.component';
import { ReportComponent } from './pages/report/report.component';
import { ViewDataSourceComponent } from './pages/view-data-source/view-data-source.component';
import { dataSetResolver } from './pages/data-set/data-set.resolver';
import { DataSetComponent } from './pages/data-set/data-set.component';
import { ListViewComponent } from './components/list-view/list-view.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { AccessibilitySettingsComponent } from './pages/settings/accessibility-settings/accessibility-settings.component';
import { DataSourcesSettingsComponent } from './pages/settings/data-sources-settings/data-sources-settings.component';
import { BrandingSettingsComponent } from './pages/settings/branding-settings/branding-settings.component';
import { FooterLinksSettingsComponent } from './pages/settings/footer-links-settings/footer-links-settings.component';
import { UserSettingsComponent } from './pages/settings/user-settings/user-settings.component';
import { SecuritySettingsComponent } from './pages/settings/security-settings/security-settings.component';

const routes: Routes = [
  {
    path: '',
    data: { breadcrumbLabel: null },
    component: AdminComponent,
    children: [
      { path: '', title: 'ADAPT Admin - Home', component: HomeComponent },
      { path: 'share/:slug', title: 'ADAPT Admin - Home', component: HomeComponent },
      {
        path: 'reports',
        title: 'ADAPT Admin - Reports',
        component: ReportsComponent,
        data: { breadcrumbLabel: 'Reports' },
        children: [
          {
            path: ':id',
            title: 'ADAPT Admin - Viewing Report',
            component: ReportComponent,
            data: { breadcrumbLabel: 'View Report' },
            canDeactivate: [
              (
                component: ReportComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState: RouterStateSnapshot
              ) => component.canDeactivate(true, nextState),
            ],
          },
        ],
      },

      {
        path: 'data-management',
        title: 'ADAPT Admin - Data Management',
        component: DataComponent,
        data: { breadcrumbLabel: 'Data Management' },
      },

      {
        path: 'data-source',
        data: { breadcrumbLabel: 'Data Source' },
        children: [
          { path: '', redirectTo: '/admin/data-management/sources', pathMatch: 'full' },
          {
            path: 'new',
            title: 'ADAPT Admin - New Data Source',
            component: UploadDataComponent,
            data: { breadcrumbLabel: 'Upload' },
          },
          {
            path: ':dataSourceID',
            title: 'ADAPT Admin - Viewing Data Source',
            component: ViewDataSourceComponent,
            data: { breadcrumbLabel: '{dataSourceID}' },
          },
        ],
      },

      {
        path: 'data-view',
        data: { breadcrumbLabel: 'Data Views' },
        children: [
          { path: '', redirectTo: '/admin/data-management/views', pathMatch: 'full' },
          {
            path: 'new',
            title: 'ADAPT Admin - New Data View',
            component: DataSetComponent,
            data: { breadcrumbLabel: 'New Data View' },
          },
          { path: ':dataSetID', redirectTo: ':dataSetID/view', pathMatch: 'full' },
          {
            path: ':dataSetID/view',
            title: 'ADAPT Admin - Viewing Data Set',
            component: DataSetComponent,
            resolve: { dataSetResolver },
            data: { breadcrumbLabel: '{dataSetID}' },
          },
          {
            path: ':dataSetID/edit',
            title: 'ADAPT Admin - Editing Data Set',
            component: DataSetComponent,
            resolve: { dataSetResolver },
            data: { breadcrumbLabel: '{dataSetID}' },
          },
        ],
      },

      {
        path: 'settings',
        data: { breadcrumbLabel: 'Settings' },
        title: 'ADAPT Admin - Settings',
        component: SettingsComponent,
        children: [
          {
            path: 'accessibility',
            component: AccessibilitySettingsComponent,
            data: { breadcrumbLabel: 'Accessibility' },
          },
          {
            path: 'data-sources',
            component: DataSourcesSettingsComponent,
            data: { breadcrumbLabel: 'Data Sources' },
          },
          {
            path: 'branding',
            component: BrandingSettingsComponent,
            data: { breadcrumbLabel: 'Branding' },
          },
          {
            path: 'footer-links',
            component: FooterLinksSettingsComponent,
            data: { breadcrumbLabel: 'Footer Links' },
            canDeactivate: [
              (
                component: ReportComponent,
                currentRoute: ActivatedRouteSnapshot,
                currentState: RouterStateSnapshot,
                nextState: RouterStateSnapshot
              ) => component.canDeactivate(true, nextState),
            ],
          },
          {
            path: 'user-management',
            component: UserSettingsComponent,
            data: { breadcrumbLabel: 'User Management' },
          },
          {
            path: 'security',
            component: SecuritySettingsComponent,
            data: { breadcrumbLabel: 'Security' },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
