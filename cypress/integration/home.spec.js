describe('Traging strategy Home', () => {

    beforeEach(() => {
        cy.visit('/');
    })

    it('User should be able to render the home page with header and navigation', () => {
        cy.contains('Algorithmic trading protocol for decentralised markets').should('be.visible');
        cy.contains(/Coming soon/i).should('be.visible');
        cy.get('[data-cy=navigation]').get('li').should('have.length', 11)
        cy.get('[data-cy=logo]')
    });

    it('User Should be able to Navigate to the about page', () => {
        cy.intercept('/about').as("about");
        cy.contains(/About/i).click();
        cy.wait("@about");
    });

    it('User should be ablte to visit the community', () => {
        const textNavLink = 'community';
        cy.intercept('/community').as("community");
        cy.contains(/community/i).click();
        cy.wait("@community");
    });

    it('logo should redirect an user back to home', () => {
        cy.intercept('/').as("home");
        cy.intercept('/about').as("about");
        cy.contains(/about/i).click();
        cy.wait("@about");
    });

    it('Use can navigate the site from home page', () => {
        cy.intercept('/').as("home");
        cy.intercept('/community').as("community");
        cy.intercept('/about').as("about");
        // community page
        cy.contains('Community').click();
        cy.wait("@community");
        cy.location('pathname').should('eq', '/community');
        cy.go('back');
        // about page
        cy.contains('About').click();
        cy.wait("@about");
        cy.location('pathname').should('eq', '/about');
        cy.go('back');
        cy.wait("@home")
      });
})
