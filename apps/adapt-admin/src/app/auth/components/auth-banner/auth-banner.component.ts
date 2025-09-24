import { Component, Input } from '@angular/core';

@Component({
  selector: 'adapt-auth-banner',
  templateUrl: './auth-banner.component.html',
  styleUrl: './auth-banner.component.scss',
})
export class AuthBannerComponent {
  @Input() label = 'Generic Auth Banner';
  @Input() logo = 'assets/ADAPT_Title_Full.svg';
  @Input() logoAlt = 'ADAPT logo';

  @Input() message = '[Message]';
  @Input() messageSubTitle = '';
}
