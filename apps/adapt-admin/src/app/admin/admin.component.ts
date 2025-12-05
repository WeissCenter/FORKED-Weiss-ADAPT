import { Component, OnInit } from '@angular/core';
import { PagesContentService } from '@adapt-apps/adapt-admin/src/app/auth/services/content/pages-content.service';

@Component({
  selector: 'adapt-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  constructor(public pagesContentService: PagesContentService) {}

  ngOnInit() {}
}
