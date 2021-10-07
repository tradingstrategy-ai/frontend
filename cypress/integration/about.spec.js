describe('Traging strategy About', () => {
    it('User should be able to navigate to the about site', () => {
        cy.visit('/about')
        cy.contains(/about/i);
        cy.get('.navbar-nav li')
            .first()
            .should('have.text', 'About');
    });
})
