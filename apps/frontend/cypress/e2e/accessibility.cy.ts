import 'cypress-axe';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('should have no accessibility violations on signup page', () => {
    cy.visit('/signup');
    cy.checkA11y();
  });

  it('should have no accessibility violations on login page', () => {
    cy.visit('/login');
    cy.checkA11y();
  });

  it('should have proper heading hierarchy', () => {
    cy.visit('/signup');
    cy.get('h1').should('exist');
    cy.get('h1').should('not.be.empty');
  });

  it('should have proper form labels', () => {
    cy.visit('/signup');
    cy.get('input[name="username"]').should('have.attr', 'aria-label', 'username');
    cy.get('input[name="email"]').should('have.attr', 'aria-label', 'email');
    cy.get('input[name="password"]').should('have.attr', 'aria-label', 'password');
  });
});