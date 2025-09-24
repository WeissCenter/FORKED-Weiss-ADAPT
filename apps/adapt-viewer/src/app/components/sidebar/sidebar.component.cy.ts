import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { ViewerSidebarComponent } from './sidebar.component';

it('simple mount', () => {
  cy.mount('<adapt-viewer-sidebar></adapt-viewer-sidebar>', {
    declarations: [ViewerSidebarComponent],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: { data: of({ result: 'test' }) },
      },
      HttpClient,
      HttpHandler,
    ],
    componentProperties: {},
  });
});
