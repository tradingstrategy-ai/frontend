describe('Trading strategy Community', () => {
	before(() => {
		cy.visit('/community');
	});

	it('Should have a Follow Us section with 3 cards', () => {
		cy.contains(/Follow us/i);
		cy.get('a[href="/blog"]').contains('Blog');
		cy.get('a[href="https://twitter.com/TradingProtocol"]').contains('Twitter');
		cy.get('a[href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"]').contains('YouTube');
		cy.get('a[href="https://www.linkedin.com/company/trading-strategy/"]').contains('LinkedIn');
		cy.get('a[href="https://t.me/trading_protocol"]').contains('Telegram');
		cy.get('a[href="https://newsletter.tradingstrategy.ai/"]').contains('Newsletter');
	});

	it('Should have a Discuss and Develop section with 3 cards', () => {
		cy.contains(/Discuss .* develop/i);
		cy.get('a[href="https://discord.gg/en8tW6MDtw"]').contains('Discord');
		cy.get('a[href="https://github.com/tradingstrategy-ai/"]').contains('GitHub');
		cy.get('a[href="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html"]').contains(
			'Algorithm tutorials'
		);
	});
});
