describe('Traging strategy Exchanges', () => {
    it('User should be able to list exchanges', () => {
      cy.visit('/trading-view/exchanges');
      cy.contains(/exchanges/i);
      cy.get('[data-cy=exchange-table]').should('be.visible');
    });

    it('Breadcrumb should be visible and have 1 element', () => {
      cy.get('[data-test-id=breadcrumb]').should('be.visible');
      cy.get('[data-test-id=breadcrumb] li')
          .should('have.length', 2)
          .contains(/Trading data/i)
  });
});
