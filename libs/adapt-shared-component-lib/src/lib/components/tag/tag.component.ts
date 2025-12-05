import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'lib-adapt-tag',
  standalone: false,
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent implements OnInit, OnChanges {
  @Input() status = '';

  classesMap: { [key: string]: boolean } = {};

  ngOnInit() {
    this.setUpClasses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setUpClasses();
  }

  public setUpClasses() {
    this.classesMap = {
      'bg-warning text-ink':
        this.status.toLowerCase() === 'draft' ||
        this.status.toLowerCase() === 'pending approval' ||
        this.status.toLowerCase() === 'processing' ||
        this.status.toLowerCase() === 'requested',

      'bg-error-darker text-white':
        this.status.toLowerCase() === 'rejected' ||
        this.status.toLowerCase() === 'missing data' ||
        this.status.toLowerCase() === 'failed',

      'bg-success-darker text-white':
        this.status.toLowerCase() === 'approved' ||
        this.status.toLowerCase() === 'available',

      'bg-primary-darker text-white': this.status.toLowerCase() === 'finalized',
      'bg-black text-white': this.status.toLowerCase() === 'external',
      'bg-base-darker text-white': this.status.toLowerCase() === 'internal' || this.status.toLowerCase() === 'inactive',
      'bg-primary-dark text-white': this.status.toLowerCase() === 'active'
    };
  }
}
