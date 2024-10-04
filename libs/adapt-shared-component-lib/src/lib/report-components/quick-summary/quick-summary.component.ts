import { QuickSummary } from "@adapt/types";
import { Component, Input } from "@angular/core";


@Component({
  selector: 'lib-adapt-quick-summary',
  templateUrl: './quick-summary.component.html',
  styleUrls: ['./quick-summary.component.scss'],
})
export class QuickSummaryComponent {
  @Input() report: any;

  @Input() content?: QuickSummary | any;

}
