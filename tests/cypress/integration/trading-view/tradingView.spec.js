describe('Trading strategy Trading View', () => {
	before(() => {
		cy.visit('/trading-view');
	});

	it('User should be able to navigate to the trading view site', () => {
		cy.contains(/Trading Data/i);
	});

	it('Should have a Explore Data section with 3 cards', () => {
		cy.visit('/trading-view');
		cy.contains(/Explore Data/i);
		cy.get('[data-testid=blockchains]');
		cy.get('[data-testid=exchanges]');
		cy.get('[data-testid=tradingpairs]');
	});

	it('Should have a Programmatic Access section with 3 cards', () => {
		cy.visit('/trading-view');
		cy.contains(/Programmatic access/i);
		cy.get('[data-testid=backtesting]');
		cy.get('[data-testid=realtime]');
		cy.get('[data-testid=doc-notebooks]');
	});

	it('Check links are defined', () => {
		cy.get('a').each(($a) => {
			const message = $a.text();
			expect($a, message).to.have.attr('href').not.contain('undefined');
		});
	});

	it('Check links are correct', () => {
		cy.get('[data-testid=link-blockchains]').invoke('attr', 'href').should('eq', '/trading-view/blockchains');

		cy.get('[data-testid=link-exchanges ]').invoke('attr', 'href').should('eq', '/trading-view/exchanges');

		cy.get('[data-testid=link-tradingpairs]').invoke('attr', 'href').should('eq', '/trading-view/trading-pairs');

		cy.get('[data-testid=link-backtesting]').invoke('attr', 'href').should('eq', '/trading-view/backtesting');

		cy.get('[data-testid=link-realtime]')
			.invoke('attr', 'href')
			.should('eq', 'https://tradingstrategy.ai/api/explorer/');

		cy.get('[data-testid=link-notebooks]')
			.invoke('attr', 'href')
			.should('eq', 'https://tradingstrategy.ai/docs/programming/index.html');
	});
});
