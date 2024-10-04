import { KeyValue } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'adapt-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() headers: string[] = [];

  @Input() data: any[] = [];

  @Input() caption = '';

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (!this.headers.length && this.data.length) {
      this.headers = Object.keys(this.data[0]);
      this.cd.detectChanges();
    }
  }

  public originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };
}
