import { Component, computed, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';
import {
  PageSectionContentText,
  PageContentText,
} from '@adapt-apps/adapt-admin/src/app/admin/models/admin-content-text.model';

@Component({
  selector: 'adapt-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  public listItems!: HTMLElement[];
  $pageContent = this.pagesContentService.getPageContentSignal('settings');
  $categoriesContent = computed(() => {
    const pageContent = this.$pageContent();
    if (pageContent?.sections?.length! > 0) {
      return pageContent?.sections![0] as PageSectionContentText;
    }
    return null;
  });

  constructor(
    private elementRef: ElementRef,
    public pagesContentService: PagesContentService
  ) {}

  ngOnInit(): void {
    //console.log('Inside settings component ngOnInit');
    this.listItems = [...this.elementRef.nativeElement.getElementsByClassName('settings-list-item')];
  }
}
