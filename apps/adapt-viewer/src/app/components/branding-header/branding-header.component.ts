import { Component, computed, Input } from '@angular/core';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'branding-header',
  standalone: false,
  templateUrl: './branding-header.component.html',
  styleUrls: ['./branding-header.component.scss'],
})
export class BrandingHeaderComponent {
  @Input() name: string | null = 'User Name';
  @Input() role: string | null = 'User Role';
  @Input() organization: string | null = 'User Organization';

  public logoURL = `${environment.logoPath ?? 'assets/logos/generic'}/state-hero-logo.${environment.logoExtension ?? 'svg'}`;
  public logoStyleClass = `${environment.logoStyleClass ?? 'width-card'}`;
  public logoIsSvg = this.logoURL.endsWith('.svg');

  public $homeContent = this.content.$homeContent;

  constructor(public content: ViewerPagesContentService) {}
}
