import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { of } from 'rxjs';
import { HttpClient, HttpHandler } from '@angular/common/http';

it('simple mount', () => {
  cy.mount('<adapt-sidebar></adapt-sidebar>', {
    declarations: [SidebarComponent],
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
