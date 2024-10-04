import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'lib-adapt-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent {
  @Input() page = 1;
  @Input() maxPages = 1;
  @Input() paginationSize = 5;

  public paginationNumbers(rulerSize?: number) {
    const arr = new Array(rulerSize || this.paginationSize).fill(null);
    const min = Math.floor(rulerSize || this.paginationSize / 2);

    return arr.map((val, idx) => {
      if (this.page <= min) {
        return idx + 1;
      } else if (this.page >= this.maxPages - min) {
        return this.maxPages - (rulerSize || this.paginationSize) + idx + 1;
      } else {
        return this.page + idx - min;
      }
    });
  }
}

export interface PaginationEvent {
  currentPage: number;
}
