describe('Trading strategy About', () => {
	before(() => {
		cy.visit('/about');
	});

	it('User should be able to navigate to the about site', () => {
		cy.contains(/Next generation algorithmic trading protocol/i);
		cy.contains(/Audience/i);
		cy.contains(/Trading strategy protocol/i);
		cy.contains(/Get in touch/i);
	});
});
