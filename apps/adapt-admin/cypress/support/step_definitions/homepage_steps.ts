import { Then } from '@badeball/cypress-cucumber-preprocessor';

Then('I should see the home page', () => {
  cy.get('.font-3xl').should('have.text', ' Test User ');
});
