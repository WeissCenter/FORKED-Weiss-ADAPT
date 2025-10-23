import { ActivatedRouteSnapshot, Route, RouterStateSnapshot } from '@angular/router';
import { AppComponent } from './app.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { HomeComponent } from './pages/home/home.component';
import { ReportComponent } from './pages/report/report.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { ErrorComponent } from './pages/error/error.component';
import { RouteBreadcrumbType } from 'libs/adapt-shared-component-lib/src/lib/components/breadcrumb/breadcrumb.component';




export const appRoutes: Route[] = [
  // {
  //   path: '',
  //   title: 'ADAPT Viewer - Home',
  //   data: { breadcrumbLabel: 'Home' },
  //   component: HomeComponent,
  // },

  {
    path: '',
    data: { breadcrumbLabel: null },
    //component: AppComponent,
    children: [
      { path: '', title: 'ADAPT Viewer - Home', component: HomeComponent },
      { path: 'share/:slug', title: 'ADAPT Admin - Home', component: HomeComponent },
      {
        path: 'reports',
        data: { breadcrumbLabel: 'reports', breadcrumbType: RouteBreadcrumbType.CONTENT  },
        children: [
          { path: '', component: ReportsComponent },
          { path: ':slug', component: ReportComponent },
        ],
      },
      {
        path: 'resources',
        title: 'ADAPT Viewer - Resources',
        component: ResourcesComponent,
        data: { breadcrumbLabel: 'resources', breadcrumbType: RouteBreadcrumbType.CONTENT  },
      },
      {
        path: '404', component: ErrorComponent
      },
      {
        path: '**', redirectTo: '404' 
      }
    ],
  },
];
