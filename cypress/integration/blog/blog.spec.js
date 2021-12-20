describe('Traging strategy About', () => {

  before(() => {
    cy.visit('/blog');
  })

	it('User should be able to navigate to the about site', () => {
		cy.contains(/Trading Strategy blog/i);
	});

});
