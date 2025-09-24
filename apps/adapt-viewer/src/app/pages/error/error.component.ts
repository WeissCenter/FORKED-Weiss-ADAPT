import { Component } from '@angular/core';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
import { ErrorPageContentText } from '../../models/content-text.model';
import { map } from 'rxjs';

@Component({
  selector: 'adapt-viewer-error',
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss',
})
export class ErrorComponent {
  $errorContent = this.pages.$errorContent;

  constructor(public pages: ViewerPagesContentService) {}
}
