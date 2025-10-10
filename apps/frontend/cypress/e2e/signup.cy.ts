describe('User Signup Flow', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should display signup form', () => {
    cy.contains('Create account').should('be.visible');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });

  it('should validate form fields', () => {
    // Test username validation
    cy.get('input[name="username"]').type('ab');
    cy.get('input[name="username"]').blur();
    cy.contains('Username must be between 3 and 30 characters').should('be.visible');

    // Test email validation
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="email"]').blur();
    cy.contains('Invalid email format').should('be.visible');

    // Test password validation
    cy.get('input[name="password"]').type('weak');
    cy.get('input[name="password"]').blur();
    cy.contains('Password must be at least 12 characters').should('be.visible');
  });

  it('should enable submit button when form is valid', () => {
    cy.get('input[name="username"]').type('testuser123');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('StrongPassword123!');
    cy.get('input[name="confirmPassword"]').type('StrongPassword123!');

    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});