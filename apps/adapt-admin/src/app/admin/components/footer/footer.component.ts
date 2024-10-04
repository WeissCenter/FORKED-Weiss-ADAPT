import { Component } from '@angular/core';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'adapt-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  public year = new Date().getFullYear();

  public $settings = this.settings.getSettingsObservable();

  constructor(public settings: SettingsService) {}
}
