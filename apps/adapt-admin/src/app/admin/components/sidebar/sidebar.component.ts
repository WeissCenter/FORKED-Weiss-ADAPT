import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../../auth/services/user/user.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { SettingsService } from '../../services/settings.service';
import { ModalComponent } from '@adapt/adapt-shared-component-lib';
import { environment } from 'apps/adapt-admin/src/environments/environment';

@Component({
  selector: 'adapt-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('confirmLogOut') confirmLogOutModal?: ModalComponent;
  @ViewChild('navList') navList!: ElementRef<HTMLUListElement>;
  public logoURL?: SafeUrl;
  public skipTo: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitzier: DomSanitizer,
    public user: UserService,
    private settings: SettingsService
  ) {
    // aem-logo.png
    this.settings.getSettingsObservable().subscribe((settings) => {
      this.logoURL = this.sanitzier.bypassSecurityTrustUrl(
        `https://${environment.s3PublicAssetsDomainName}.s3.amazonaws.com/${settings.logo}`
      );
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        (document.querySelector('.skip-to')?.querySelector('button') as HTMLButtonElement)?.focus();
      }
    });
  }

  nav_collapsed = true;

  toggleNav() {
    this.nav_collapsed = !this.nav_collapsed;
  }

  ngAfterViewInit(): void {
    this.navList.nativeElement.querySelectorAll('[role="menuitem"]').forEach((item, index, items) => {
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

  public startSignout($event: any) {
    if ($event.code !== 'Enter' && $event.code !== 'Space' && !($event instanceof PointerEvent)) return;
    this.confirmLogOutModal?.open();
    this.closeMenuOnNavigation();
  }

  public signOut(event: any) {
    this.confirmLogOutModal?.close();
    this.user.logout();
  }

  public cancelLogout(event: any) {
    this.confirmLogOutModal?.close();
  }
}
