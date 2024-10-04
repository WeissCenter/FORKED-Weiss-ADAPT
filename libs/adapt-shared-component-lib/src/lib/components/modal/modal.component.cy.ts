import { ModalComponent } from './modal.component';

it('simple mount', () => {
  cy.mount('<adapt-modal></adapt-modal>', {
    declarations: [ModalComponent],
    componentProperties: {},
  });
});
