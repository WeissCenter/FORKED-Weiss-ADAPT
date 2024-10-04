import { Before, Given } from '@badeball/cypress-cucumber-preprocessor';

Before({ tags: '@mobile' }, () => {
  cy.mobileView();
});

Before({ tags: '@tablet' }, () => {
  cy.tabletView();
});

Before({ tags: '@desktop' }, () => {
  cy.desktopView();
});

Given('I am on a mobile device', () => {
  cy.mobileView();
});

Given('I am on a tablet device', () => {
  cy.tabletView();
});

Given('I am on a desktop device', () => {
  cy.desktopView();
});
