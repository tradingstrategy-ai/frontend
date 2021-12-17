describe('Traging strategy Community', () => {
    before(() => {
        cy.visit('/community');
    })

    it('User should be able to navigate to the Community site', () => {
        cy.visit('/community')
        cy.contains(/community/i);
    });

    it('Should have a Follow Us section with 3 cards', () => {
		cy.contains(/Follow Us/i);
		cy.get('[data-testid=blog]');
		cy.get('[data-testid=twitter]');
		cy.get('[data-testid=telegram]');
		cy.get('[data-testid=newsletter]');
	});

    it('Should have a Discuss and Develop section with 3 cards', () => {
		cy.contains(/Discuss and develop/i);
		cy.get('[data-testid=discord]');
		cy.get('[data-testid=github]');
		cy.get('[data-testid=algorithm]');
	});

	it('Check links are defined', () => {
		cy.get('a').each(($a) => {
			const message = $a.text();
			expect($a, message).to.have.attr('href').not.contain('undefined');
		});
	});

	it('Check links are correct', () => {
		cy.get('[data-testid=link-blog]')
			.invoke('attr', 'href')
			.should('eq', '/blog');

		cy.get('[data-testid=link-twitter]')
			.invoke('attr', 'href')
			.should('eq', 'https://twitter.com/TradingProtocol');

		cy.get('[data-testid=link-telegram]')
			.invoke('attr', 'href')
			.should('eq', 'https://t.me/trading_protocol');

		cy.get('[data-testid=link-newsletter ]')
			.invoke('attr', 'href')
			.should('eq', 'https://newsletter.tradingstrategy.ai/');

		cy.get('[data-testid=link-discord]')
			.invoke('attr', 'href')
			.should('eq', 'https://discord.gg/yReMpKykaS');

        cy.get('[data-testid=link-github]')
			.invoke('attr', 'href')
			.should('eq', 'https://github.com/tradingstrategy-ai/');

		cy.get('[data-testid=link-algorithm]')
			.invoke('attr', 'href')
			.should('eq', 'https://tradingstrategy.ai/docs/programming/examples/getting-started.html');
	});

})

