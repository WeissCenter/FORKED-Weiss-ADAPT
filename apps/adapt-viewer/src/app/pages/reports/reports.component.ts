import { ActivatedRoute, Router } from '@angular/router';
import { AdaptDataService } from '../../services/adapt-data.service';
import { Component } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { IReport } from '@adapt/types';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
import { LanguageService } from '@adapt/adapt-shared-component-lib';

@Component({
  selector: 'adapt-viewer-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent {
  public pageSize = 5;
  public totalItems = 0;
  public maxPages = 0;
  public page = 1;
  public alphaSortDirection: 'asc' | 'desc' = 'asc';
  public filterStatusMessage = '';
  public publishedSortDirection: 'asc' | 'desc' = 'desc';
  public focusSortBtn = false;
  activeSort: 'updated' | 'alpha' = 'updated'; // default sort by updated date

  public $reports = this.fetchReports();

  public reportsData: IReport[] = [];
  $content = this.content.$viewerContent;

  constructor(public data: AdaptDataService, private route: ActivatedRoute, private router: Router, public content: ViewerPagesContentService, private lang: LanguageService) {}

  fetchReports() {
    return this.route.queryParams.pipe(
      switchMap((params) => {
        // Extract parameters
        this.page = parseInt(params['page'] || '1');
        this.publishedSortDirection = params['publishSort'] || 'desc';
        this.alphaSortDirection = params['alphaSort'] || 'desc';
        // if single status or visibility, convert to array

        return this.data.reports.pipe(
          map((reports) => {
            // Filter reports based on the status and visibility

            const sorted = reports.toSorted((a: IReport, b: IReport) => {
              const updatedA = parseInt(a.published, 10); // Convert the string to an integer
              const updatedB = parseInt(b.published, 10);
              const alphaA = a.name;
              const alphaB = b.name;

              const sort = (a: any, b: any, type: string, direction: 'asc' | 'desc') => {
                const left = direction === 'asc' ? a : b;
                const right = direction === 'asc' ? b : a;

                switch (type) {
                  case 'string': {
                    return left.localeCompare(right);
                  }
                  case 'number': {
                    return left - right;
                  }
                }
              };

              let sortResult = this.activeSort === 'updated' ? 
                sort(updatedA, updatedB, 'number', this.publishedSortDirection) : 
                sort(alphaA, alphaB, 'string', this.alphaSortDirection);

              return sortResult;
            });

            // if (this.focusSortBtn) {
            //   const sortBtn = document.getElementById('sortButton');
            //   if (sortBtn) {
            //     sortBtn.focus();
            //     sessionStorage.removeItem('focusSortBtn');
            //   }
            // }

            // Store the processed data for later use
            this.reportsData = sorted;

            // Update maxPages for pagination
            this.maxPages = Math.max(1, Math.ceil(this.reportsData.length / this.pageSize));
            this.totalItems = this.reportsData.length;

            return sorted;
          })
        );
      })
    );
  }

  public onPageSizeChange() {
    this.maxPages = Math.ceil(this.totalItems / this.pageSize);
  }

  public applyFilters(announce = false) {
    sessionStorage.setItem('focusSortBtn', true.toString());
    this.router.navigate(['./'], {
      queryParams: {
        publishSort: this.publishedSortDirection,
        alphaSort: this.alphaSortDirection,
      },
      relativeTo: this.route,
      queryParamsHandling: 'merge',
    });
    if (announce) {
      const content = this.content.$reportsContent();

      this.filterStatusMessage = content?.filterApplied || '';
    }
  }

  public doSort(what: 'alpha' | 'updated') {
    if (what === 'alpha') {
      this.alphaSortDirection = this.alphaSortDirection === 'asc' ? 'desc' : 'asc';
    } else if (what === 'updated') {
      this.publishedSortDirection = this.publishedSortDirection === 'asc' ? 'desc' : 'asc';
    }

    const content = this.content.$reportsContent();


    this.filterStatusMessage = content?.sortApplied || '';
    this.focusSortBtn = true;
    this.activeSort = what;
    this.applyFilters();
  }
}
