import { Component, Input } from '@angular/core';

@Component({
  selector: 'adapt-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
})
export class HeroBannerComponent {
  @Input() name: string | null = 'User Name';
  @Input() role: string | null = 'User Role';
  @Input() organization: string | null = 'User Organization';
}
