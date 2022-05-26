describe('Trading strategy About', () => {
	before(() => {
		cy.visit('/about');
	});

	it('User should be able to navigate to the about site', () => {
		cy.contains(/about/i);
	});

	it('Should have a Audience section with 3 cards', () => {
		cy.contains(/Audience/i);
		cy.get('[data-testid=traders]');
		cy.get('[data-testid=hedge]');
		cy.get('[data-testid=defi]');
	});

	it('Check links are defined', () => {
		cy.get('a').each(($a) => {
			const message = $a.text();
			expect($a, message).to.have.attr('href').not.contain('undefined');
		});
	});

	it('Check links are correct', () => {
		cy.get('[data-testid=link-traders]').invoke('attr', 'href').should('eq', '/');

		cy.get('[data-testid=link-hedge ]').invoke('attr', 'href').should('eq', 'mailto:info@tradingstrategy.ai');

		cy.get('[data-testid=link-defi]').invoke('attr', 'href').should('eq', 'mailto:info@tradingstrategy.ai');
	});

	it('Should have a Unique Value proposition section with 3 cards', () => {
		cy.contains(/Unique value proposition/i);
		cy.get('[data-testid=link-active-trading]');
		cy.get('[data-testid=link-funds-control]');
		cy.get('[data-testid=link-active-trading]');
	});
});
