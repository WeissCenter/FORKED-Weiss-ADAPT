import { Component, ViewEncapsulation } from '@angular/core';
import { environment } from 'apps/adapt-admin/src/environments/environment';

@Component({
  selector: 'adapt-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BannerComponent {
  environment = environment;
}
