import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationCancel, NavigationEnd, Router } from '@angular/router';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  merge,
  mergeAll,
  of,
  startWith,
  take,
  tap,
} from 'rxjs';

@Component({
  selector: 'lib-adapt-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {
  @Input() root = '';
  public paramsHistory: { [path: string]: any } = {};

  public breadcrumbs: Observable<Breadcrumb[]> = this.router.events.pipe(
    startWith('Init'),
    distinctUntilChanged(),
    filter((event) => event === 'Init' || event instanceof NavigationEnd || event instanceof NavigationCancel),
    map(() => {
      const breadcrumbs = [];

      if(this.root.length) breadcrumbs.push({link: '', label: this.root})

      return this.getBreadcrumbs(this.route.root, '', breadcrumbs)
    
    })
  );

  public breadcrumbsLabel = this.breadcrumbs.pipe(
    map((crumbs) => `Breadcrumbs: ${crumbs.map((item) => item.label).join(', ')}`)
  );

  showBreadcrumb = true;

  constructor(private route: ActivatedRoute, private router: Router) {}

  private getBreadcrumbs(route: ActivatedRoute, url = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (!children.length) return breadcrumbs;

    for (const child of children) {
      if (child.outlet !== 'primary') continue;

      if (!child.snapshot?.data['breadcrumbLabel']) return this.getBreadcrumbs(child, url, breadcrumbs);

      const routeURL = child.snapshot.url.map((segment) => segment.path).join('/');

      url += `/${routeURL}`;

      let label = child.snapshot.data['breadcrumbLabel'] as string;

      const variableRegex = /{(.+?)}/g;

      if (label.match(variableRegex)) {
        label = label.replace(variableRegex, (match, code) => {
          return child.snapshot.params[code];
        });
      }

      if (Object.keys(child.snapshot.queryParams).length) {
        this.paramsHistory[label] = child.snapshot.queryParams;
      }

      const breadcrumb: Breadcrumb = {
        label: label,
        link: url,
        queryParams: this.paramsHistory[label],
      };

      if (breadcrumb.label) {
        breadcrumbs.push(breadcrumb);
      }
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }

    return [];
  }

  private updateBreadcrumbVisibility(url: string) {
    // Assuming '/admin' is the route path for the home/landing page
    this.showBreadcrumb = (url !== '/admin' && url !== '/');
  }

  ngOnInit() {
    // Perform an initial check of the current route
    this.updateBreadcrumbVisibility(this.router.url);

    // Subscribe to future route changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateBreadcrumbVisibility(event.urlAfterRedirects);
      }
    });
  }
}

interface Breadcrumb {
  link: string;
  label: string;
  queryParams?: any;
}
