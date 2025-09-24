import { Component, computed } from '@angular/core';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
import { environment } from '@adapt-apps/adapt-viewer/src/environments/environment';
import { SettingsService } from '@adapt/adapt-shared-component-lib';

@Component({
  selector: 'adapt-viewer-footer',
  templateUrl: './viewer-footer.component.html',
  styleUrls: ['./viewer-footer.component.scss'],
})
export class ViewerFooterComponent {
  public year = new Date().getFullYear();

  logoUrl: string = `https://${environment.appDomain}/assets/shared/logos/aem-logo.svg`;
  stackedLogoUrl: string = `https://${environment.appDomain}/assets/shared/logos/weiss-logo-text-stacked.svg`;
  $footerContent = computed(() => this.content.$sharedContent()?.footer);

  public $settings = this.settings.getSettingsSignal();

  constructor(
    public content: ViewerPagesContentService,
    public settings: SettingsService
  ) {}
}
