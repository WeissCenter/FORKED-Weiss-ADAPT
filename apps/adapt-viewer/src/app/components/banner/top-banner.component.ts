import { Component, ViewEncapsulation } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'adapt-top-banner',
  templateUrl: './top-banner.component.html',
  styleUrls: ['./top-banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TopBannerComponent {
  environment = environment;
  public showTestingBanner = environment.envLabel !== 'Prod';
}
