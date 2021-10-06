describe('Traging strategy Home', () => {

    beforeEach(() => {
        cy.visit('/');
    })

    it('User should be able to render the home page with header and navigation', () => {
        cy.contains('Algorithmic trading strategy protocol').should('be.visible');
        cy.contains(/Coming soon/i).should('be.visible');
        cy.get('.navbar-nav li').should('have.length', 3)
            .last()
            .should('have.text', 'Community')
        cy.get('[data-cy=logo]')
    });

    it('has a navigation about link', () => {
        cy.contains(/about/i).click();
        cy.get('.navbar-nav li')
            .first()
            .should('have.text', 'About')
    });

    it('has a link to community', () => {
        const textNavLink = 'community';
        cy.contains(/community/i).click();
        cy.get('.navbar-nav li')
            .last()
            .should('have.text', 'Community')
    });

    it('logo should redirect an user back to home', () => {
        cy.contains(/about/i).click();
        cy.get('.navbar-nav li')
            .first()
            .should('have.text', 'About')
        //cy.contains('Algorithmic trading strategy protocol').should('be.not.visible');
        cy.get('[data-cy=logo]').click()
        cy.contains('Algorithmic trading strategy protocol').should('be.visible');
    });

    it('click all links', () => {

        cy.visit('/')

        // community page
        cy.contains('Community').click()
        cy.location('pathname').should('eq', '/community')
        cy.go('back')

        // about page
        cy.contains('About').click()
        cy.location('pathname').should('eq', '/about')
        cy.go('back')

      });

})
