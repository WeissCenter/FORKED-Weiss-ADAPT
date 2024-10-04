describe('adapt-admin', () => {
  beforeEach(() => cy.envLogin());

  it('should display welcome message', () => {
    cy.get('.font-3xl').should('have.text', ' Test User ');
  });

  afterEach(() => cy.logout());
});
