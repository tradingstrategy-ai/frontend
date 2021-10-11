describe('Traging strategy Exchanges', () => {
    it('User should be able to list exchanges', () => {
      cy.visit('/market-data/exchanges');
      cy.contains(/exchanges/i);
      cy.get('[data-cy=exchange-table]').should('be.visible');
    });
});
