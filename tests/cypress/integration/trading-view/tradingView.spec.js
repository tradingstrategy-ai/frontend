describe('Trading strategy Trading View', () => {
	before(() => {
		cy.visit('/trading-view');
	});

	it('User should be able to navigate to the trading view site', () => {
		cy.contains(/Trading Data/i);
	});

	it('Should have a Explore Data section with 4 cards', () => {
		cy.contains(/Explore Data/i);
		cy.get('a[href="/trading-view/blockchains"]').contains(/View blockchains/i);
		cy.get('a[href="/trading-view/exchanges"]').contains(/View exchanges/i);
		cy.get('a[href="/trading-view/trading-pairs"]').contains(/View trading pairs/i);
		cy.get('a[href="/search"]').contains(/Search tokens/i);
	});

	it('Should have a Programmatic Access section with 3 cards', () => {
		cy.contains(/Programmatic access/i);
		cy.get('a[href="/trading-view/backtesting"]').contains(/Download datasets/i);
		cy.get('a[href="https://tradingstrategy.ai/api/explorer/"]').contains(/Read API specification/i);
		cy.get('a[href="https://tradingstrategy.ai/docs/programming/index.html"]').contains(/Read documentation/i);
	});
});
