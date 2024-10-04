import { After, Before } from '@badeball/cypress-cucumber-preprocessor';

Before({ tags: '@loggedin' }, () => {
  cy.envLogin();
});

After({ tags: '@loggedin' }, () => {
  cy.logout();
});
