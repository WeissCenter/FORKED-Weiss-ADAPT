import { Component, Input } from '@angular/core';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
@Component({
  selector: 'branding-header',
  templateUrl: './branding-header.component.html',
  styleUrls: ['./branding-header.component.scss'],
})
export class BrandingHeaderComponent {
  @Input() name: string | null = 'User Name';
  @Input() role: string | null = 'User Role';
  @Input() organization: string | null = 'User Organization';

  public svgLogo = true;
  public logoURL;

  public $homeContent = this.content.$homeContent;

  constructor(public content: ViewerPagesContentService) {
    this.logoURL = 'assets/shared/logos/viewer-header-logo.svg';
    this.svgLogo = this.logoURL.toString().includes('.svg');
  }
}
