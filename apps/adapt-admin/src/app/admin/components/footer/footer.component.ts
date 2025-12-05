import { Component, effect } from '@angular/core';
import { SettingsService } from '@adapt/adapt-shared-component-lib';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'adapt-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  public year = new Date().getFullYear();
  public copyrightText = environment.copyrightText || 'AEM Corporation.';

  public $settings = this.settings.getSettingsSignal();

  constructor(public settings: SettingsService) {}

}
