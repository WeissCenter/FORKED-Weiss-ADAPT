import { HeaderBlock } from '@adapt/types';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-adapt-report-heading-block',
  templateUrl: './report-heading-block.component.html',
  styleUrls: ['./report-heading-block.component.scss'],
})
export class ReportHeadingBlockComponent {
  @Input() content?: any;
}
