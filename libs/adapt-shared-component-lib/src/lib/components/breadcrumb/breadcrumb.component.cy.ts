import { ActivatedRoute } from '@angular/router';
import { BreadcrumbComponent } from './breadcrumb.component';

it('simple mount', () => {
  cy.mount('<adapt-breadcrumb></adapt-breadcrumb>', {
    declarations: [BreadcrumbComponent],
    componentProperties: {},
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          root: {
            children: [],
          },
        },
      },
    ],
  });
});
