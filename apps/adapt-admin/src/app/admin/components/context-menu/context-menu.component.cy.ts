import { ContextMenuComponent } from './context-menu.component';

it('simple mount', () => {
  cy.mount('<adapt-context-menu></adapt-context-menu>', {
    declarations: [ContextMenuComponent],
    componentProperties: {},
  });
});
