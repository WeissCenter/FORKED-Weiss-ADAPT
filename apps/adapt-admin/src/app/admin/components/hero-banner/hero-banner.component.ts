import { Component, computed, Input } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'adapt-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
})
export class HeroBannerComponent {
  @Input() name: string | null = 'User Name';
  @Input() role: string | null = 'User Role';
  @Input() organization: string | null = 'User Organization';

  public logoURL = `${environment.logoPath ?? 'assets/logos/generic'}/state-hero-logo.${environment.logoExtension ?? 'svg'}`;
  public logoIsSvg = this.logoURL.endsWith('.svg');
  
}
