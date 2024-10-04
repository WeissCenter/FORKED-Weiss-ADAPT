/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    login(email: string, password: string): void;
    envLogin(): void;
    logout(): void;
    mobileView(): void;
    tabletView(): void;
    desktopView(): void;
  }
}

// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('#email').type(email);
  cy.get('#password-sign-in').type(password);
  cy.get('#submit-btn').click();
});

Cypress.Commands.add('envLogin', () => {
  cy.login(Cypress.env('USERNAME'), Cypress.env('PASSWORD'));
});

Cypress.Commands.add('logout', () => {
  // cy.get('#expand-menu-button > :nth-child(2)').click();
  // cy.get(':nth-child(10) > .usa-icon-list__item > span').click();
  if (Cypress.config('viewportWidth') < 1024) {
    cy.get('#expand-menu-button > :nth-child(2)').click();
    cy.get(':nth-child(10) > .usa-icon-list__item > span').click();
  } else {
    cy.get(':nth-child(10) > .usa-icon-list__item > .fal').click();
  }
});

Cypress.Commands.add('mobileView', () => {
  cy.viewport(480, 720);
});

Cypress.Commands.add('tabletView', () => {
  cy.viewport(640, 768);
});

Cypress.Commands.add('desktopView', () => {
  cy.viewport(1024, 768);
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
