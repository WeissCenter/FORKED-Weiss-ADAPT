import { Component, Inject, OnInit, PLATFORM_ID, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ResourcePageContentText, SharedContentText } from '../../models/content-text.model';
import { ViewerPagesContentService } from '../../services/content/viewer-pages-content.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'adapt-viewer-resources',
  standalone: false,
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.scss',
})
export class ResourcesComponent {
  public navigation = this.route.queryParams.pipe(map((params) => params?.['navigation'] || 'useful-links'));
  public fragment = this.route.fragment.pipe(filter(val => !!val), startWith('general-understanding'));

  $resourcesContent = this.viewerPagesContentService.$resourcesContent;
  $sharedContent = this.viewerPagesContentService.$sharedContent;

  constructor(
    public viewerPagesContentService: ViewerPagesContentService,
    public route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Navigates to a section and moves focus to the section heading.
   * Uses buttons instead of anchors per accessibility audit recommendation.
   * @param fragmentId The fragment identifier for the target section
   */
  navigateToSection(fragmentId: string | undefined): void {
    if (!fragmentId) return;

    // Update URL fragment for bookmarkability
    this.router.navigate([], {
      fragment: fragmentId,
      queryParamsHandling: 'merge'
    }).then(() => {
      // Focus the target heading after navigation completes
      setTimeout(() => {
        const heading = document.getElementById(`heading-${fragmentId}`) as HTMLElement;
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus();
          heading.addEventListener('blur', () => {
            heading.removeAttribute('tabindex');
          }, { once: true });
        }
      }, 0);
    });
  }
}
