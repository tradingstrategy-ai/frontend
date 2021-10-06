describe('Traging strategy Exchanges', () => {

    beforeEach(() => {
        cy.visit('/exchanges');
    })

    describe('Testing Wikipedia', () => {
        it('I can search for content', () => {
          cy.visit('https://www.wikipedia.org');
          cy.get("input[type='search']").type('Leo Panthera');
          cy.get("button[type='submit']").click();
          cy.contains('Search results');
          cy.contains('Panthera leo leo');
        });
      });

    it('should render Home with navbar with 3 elements', () => {
        cy.contains('Exchanges').should('be.visible');
    });

});
