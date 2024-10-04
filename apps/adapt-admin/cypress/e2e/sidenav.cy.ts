import { closeUpcomingFeatureModal, isUpcomingFeatureModalVisible } from '../support/app.po';

const DISABLED_SIDE_NAV_BUTTONS = {
  glossaryBtn: ' Glossary ',
  alertBtn: ' Alerts ',
  settingsBtn: ' Settings ',
};

describe('Side Nav', () => {
  beforeEach(() => cy.envLogin());
  afterEach(() => cy.logout());

  it('Side Nav should have sections', () => {
    cy.get(':nth-child(1) > .usa-icon-list__item').should('have.text', ' Home ');
    cy.get(':nth-child(1) > .usa-icon-list__item').should('have.attr', 'routerlink', '/admin');

    cy.get(':nth-child(2) > .usa-icon-list__item').should('have.text', ' Data ');
    cy.get(':nth-child(2) > .usa-icon-list__item').should('have.attr', 'routerlink', 'data-management');

    cy.get(':nth-child(3) > .usa-icon-list__item').should('have.text', ' Reports ');
    cy.get(':nth-child(3) > .usa-icon-list__item').should('have.attr', 'routerlink', 'reports');

    for (const [button, text] of Object.entries(DISABLED_SIDE_NAV_BUTTONS)) {
      cy.get(`#${button}`).should('have.text', text);
      cy.get(`#${button}`).click();
      isUpcomingFeatureModalVisible();
      closeUpcomingFeatureModal();
    }

    cy.get('#accessibilityCenterBtn').should('have.text', ' Accessibility ');

    cy.get(':nth-child(9) > .usa-icon-list__item').should('have.text', ' Give Feedback ');
    cy.get(':nth-child(9) > .usa-icon-list__item').should('have.attr', 'href', 'https://forms.office.com/r/Q88TN6zygX');

    cy.get(':nth-child(10) > .usa-icon-list__item').should('have.text', ' Sign Out ');
  });

  it('Side Nav do not show upcoming features modal again', () => {
    for (const [button] of Object.entries(DISABLED_SIDE_NAV_BUTTONS)) {
      cy.get(`#${button}`).click();
      isUpcomingFeatureModalVisible();
      cy.get('.usa-checkbox__label').click();
      closeUpcomingFeatureModal();
      cy.get(`#${button}`).should('have.attr', 'aria-disabled', 'true');
    }
  });
});
