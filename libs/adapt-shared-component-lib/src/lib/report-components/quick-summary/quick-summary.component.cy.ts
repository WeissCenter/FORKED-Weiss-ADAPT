import { QuickSummaryComponent } from './quick-summary.component';

it('simple mount', () => {
  cy.mount('<adapt-quick-summary></adapt-quick-summary>', {
    declarations: [QuickSummaryComponent],
    componentProperties: {},
  });
});
