import { AfterViewInit, Component, computed, effect, ElementRef, HostBinding, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ModalComponent, SettingsService } from '@adapt/adapt-shared-component-lib';
import { environment } from '../../../environments/environment';

import { DOCUMENT } from '@angular/common';
import { WeissAccessibilityCenterService } from 'weiss-accessibility-center';
import { LanguageService } from '@adapt/adapt-shared-component-lib';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
import { SidePanelComponent } from 'libs/adapt-shared-component-lib/src/lib/components/side-panel/side-panel.component';
import { map, switchMap } from 'rxjs';
import { LanguageCode } from '@adapt/types';

@Component({
  selector: 'adapt-viewer-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class ViewerSidebarComponent implements AfterViewInit {
  @ViewChild('confirmLogOut') confirmLogOutModal?: ModalComponent;
  @ViewChild('navList') navList!: ElementRef<HTMLUListElement>;
  @ViewChild('languageSelector') languageSelector: SidePanelComponent;

  public sidePanelOpen = false;

  @HostBinding('class.sidebar-fixed')
  get isFixed() {
    return !this.sidePanelOpen;
  }

  @HostBinding('class.sidebar-absolute')
  get isAbsolute() {
    return this.sidePanelOpen;
  }

  // magnifying glass logo
  collapsedLogo = `https://${environment.appDomain}/assets/shared/svg/adapt-nav-logo.svg`;
  openLogo = `https://${environment.appDomain}/assets/shared/svg/adapt-Title_Full.svg`;

  // sidebar logo
  sidebarLogo = `https://${environment.appDomain}/assets/shared/logos/state-nav-logo.svg`;

  public skipTo: any;

  public $sharedContent = this.content.$sharedContent;
  public $sidebar = computed(() => this.$sharedContent()?.sidebar);

  public $langOptions = computed(() => {
    const sharedContent = this.$sharedContent();
    const settings = this.settings.getSettingsSignal()();
    const supportedLanguages = settings.supportedLanguages || ['en'];

    return sharedContent?.accessibility?.language.supportedLanguages.filter((supportedLang) =>
      supportedLanguages.includes(supportedLang.langCode as LanguageCode)
    );
  });
  langModel: string;


  constructor(
    public content: ViewerPagesContentService,
    private router: Router,
    private sanitzier: DomSanitizer,
    private center: WeissAccessibilityCenterService,
    public settings: SettingsService,
    public language: LanguageService,
    @Inject(DOCUMENT) private document: Document 
  ) {
    // this.logoURL = this.sanitzier.bypassSecurityTrustUrl('https://dev-adapt-public-assets-bucket.s3.us-east-1.amazonaws.com/DOE-Hawaii-logo-512.png');
    // this.logoURL = 'assets/shared/logos/weiss-logo.png';

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        (this.document.querySelector('.skip-to')?.querySelector('button') as HTMLButtonElement)?.focus();
      }
    });

    this.langModel = this.language.$language();
  }

  nav_collapsed = true;

  toggleNav() {
    this.nav_collapsed = !this.nav_collapsed;
  }

  ngAfterViewInit(): void {
    this.navList?.nativeElement.querySelectorAll('[role="menuitem"]').forEach((item, index, items) => {
      // Count starts at 1 for humans
      const position = index + 1;
      const total = items.length;

      // NVDA and JAWS supports automatic x of n annouce however mac voice over doesn't so we don't need to add these on windows devices
      if (!navigator.userAgent.includes('Mac OS X')) {
        return;
      }

      item.addEventListener('focus', () => {
        const customLabel = `${position} of ${total}`;
        item.setAttribute('aria-roledescription', customLabel);
      });

      item.addEventListener('blur', () => {
        item.removeAttribute('aria-roledescription');
      });
    });
  }

  closeMenuOnNavigation() {
    // if at mobile size, close the menu when a link is clicked
    if (window.innerWidth < 640) {
      this.nav_collapsed = true;
    }
  }

  public handleLangChange(lang: string) {
    this.language.changeLanguage(lang);
  }

  public onSidePanelStatusChange(isOpen: boolean) {
    this.sidePanelOpen = isOpen;
  }

  public signOut() {
    this.confirmLogOutModal?.close();
    // this.user.logout();
  }
}
