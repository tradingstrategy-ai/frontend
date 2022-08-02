describe('Trading strategy Home', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('User should be able to render the home page with header and navigation', () => {
		cy.contains(/Next generation algorithmic trading protocol for decentralised markets/i).should('be.visible');
		cy.contains(/Coming soon/i).should('be.visible');
		cy.get('header nav').find('li').should('have.length', 5);
		cy.get('header .logo svg');
		cy.get('[data-cy=search]');
	});

	it('User Should be able to Navigate to the about page', () => {
		cy.get('nav').contains(/About/i).click();
		cy.location('pathname').should('eq', '/about');
	});

	it('User should be ablte to visit the community', () => {
		cy.get('nav')
			.contains(/Community/i)
			.click();
		cy.location('pathname').should('eq', '/community');
	});

	it('logo should redirect a user back to home', () => {
		cy.get('header .logo a').click();
		cy.location('pathname').should('eq', '/');
	});

	it('should include Google Sitelinks search box metadata', () => {
		cy.get('head > script[type="application/ld+json"]')
			.invoke('html')
			.then(JSON.parse)
			.should('have.nested.property', 'potentialAction.@type', 'SearchAction');
	});
});
