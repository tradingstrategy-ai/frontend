describe('Trading strategy Home', () => {
	beforeEach(() => {
		cy.visit('/');
	});

	it('User should be able to render the home page with header and navigation', () => {
		cy.contains('Next generation algorithmic trading protocol for decentralised markets').should('be.visible');
		cy.contains(/Coming soon/i).should('be.visible');
		cy.get('[data-cy=navbar]').get('li').should('have.length', 5);
		cy.get('header .logo svg');
		cy.get('[data-cy=search]');
	});

	it('User Should be able to Navigate to the about page', () => {
		cy.intercept('/about').as('about');
		cy.contains(/About/i).click({ force: true });
		cy.wait('@about');
	});

	it('User should be ablte to visit the community', () => {
		const textNavLink = 'community';
		cy.intercept('/community').as('community');
		cy.contains(/community/i).click({ force: true });
		cy.wait('@community');
	});

	// inconsistent test behavior - skipping for now
	xit('logo should redirect a user back to home', () => {
		cy.intercept('/').as('home');
		cy.get('.logo a').click();
		cy.wait('@home');
	});

	it('User can navigate the site from home page', () => {
		cy.intercept('/').as('home');
		cy.intercept('/community').as('community');
		cy.intercept('/about').as('about');
		// community page
		cy.contains('Community').click({ force: true });
		cy.wait('@community');
		cy.location('pathname').should('eq', '/community');
		cy.go('back');
		// about page
		cy.contains('About').click({ force: true });
		cy.wait('@about');
		cy.location('pathname').should('eq', '/about');
		cy.go('back');
		cy.wait('@home');
	});

	it('should include Google Sitelinks search box metadata', () => {
		cy.get('head > script[type="application/ld+json"]')
			.invoke('html')
			.then(JSON.parse)
			.should('have.nested.property', 'potentialAction.@type', 'SearchAction');
	});
});
