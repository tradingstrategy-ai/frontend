describe('Traging strategy trading-view blockchains index', () => {
  before(() => {
    cy.visit('/trading-view/blockchains');
  })

  it('User should be able to navigate to the about site', () => {
    cy.contains(/blockchains/i);
  });
});
