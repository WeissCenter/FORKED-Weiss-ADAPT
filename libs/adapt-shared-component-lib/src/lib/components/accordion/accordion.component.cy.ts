import { AccordionComponent } from './accordion.component';

it('simple mount', () => {
  cy.mount('<lib-adapt-accordion></lib-adapt-accordion>', {
    componentProperties: {},
    declarations: [AccordionComponent],
  });
});
