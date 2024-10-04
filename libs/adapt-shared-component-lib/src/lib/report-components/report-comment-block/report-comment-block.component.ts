import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-adapt-report-comment-block',
  templateUrl: './report-comment-block.component.html',
  styleUrls: ['./report-comment-block.component.scss'],
})
export class ReportCommentBlockComponent {
  @Input() content: any;
}
