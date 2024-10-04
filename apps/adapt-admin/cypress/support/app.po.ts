export const getGreeting = () => cy.get('h1');

export const isUpcomingFeatureModalVisible = () =>
  cy.get('.usa-modal__heading').should('have.text', 'Upcoming feature');

export const closeUpcomingFeatureModal = () => cy.get('.usa-modal__main > .gap-2 > .usa-button > .fas').click();
