describe('Traging strategy Community', () => {
    it('User should be able to navigate to the about site', () => {
        cy.visit('/community')
        cy.contains(/community/i);
    });

    it('Breadcrumb should be visible and have 1 element', () => {
        cy.get('[data-test-id=breadcrumb]').should('be.visible');
        cy.get('[data-test-id=breadcrumb] li')
            .should('have.length', 1)
            .contains(/community/i);
    });
})
