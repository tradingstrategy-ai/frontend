describe('Trading strategy Exchanges', () => {
    it('User should be able to list exchanges', () => {
        cy.visit('/trading-view/exchanges');
        cy.contains(/exchanges/i);
        cy.get('[data-cy=exchange-table]').should('be.visible');
    });

    it('Breadcrumb should be visible and have 1 element', () => {
        cy.get('[data-testid=breadcrumb]')
            .should('be.visible')
            .find('li')
            .should('have.length', 2)
            .contains(/Trading data/i);
  });
});
