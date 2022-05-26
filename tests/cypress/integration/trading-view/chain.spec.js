describe('Trading strategy trading-view blockchains index', () => {
	before(() => {
		cy.visit('/trading-view/ethereum');
	});

	it('User should be able to navigate to the ethereum chain site', () => {
		cy.visit('/trading-view/ethereum');
		cy.contains(/Ethereum blockchain/i);
		cy.contains(/Exchanges on Ethereum/i);
	});

	// it('User should be able to navigate to the Bsc chain site', () => {
	//   cy.visit('/trading-view/binance');
	//   cy.contains(/Binance Smart chain blockchain/i);
	//   cy.contains(/Exchanges on binance/i);
	// });

	// it('User should be able to navigate to the polygon chain site', () => {
	//   cy.visit('/trading-view/polygon');
	//   cy.contains(/Polygon Blockchain/i);
	//   cy.contains(/Exchanges on polygon/i);
	// });
});
