describe('Trading Strategy exchanges trading pair export', () => {
	beforeEach(() => {
		cy.visit('/trading-view/ethereum/uniswap-v2/export-data');
	});

	it('Should show correct title', () => {
		cy.get('[data-testid=title]').contains('Export trading pair data for Uniswap v2');
	});
});
