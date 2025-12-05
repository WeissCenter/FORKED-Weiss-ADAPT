import { Component, Inject, OnInit, PLATFORM_ID, Signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(public viewerPagesContentService: ViewerPagesContentService, public route: ActivatedRoute) {

  }

  // ngOnInit() {}
}
