describe('Traging strategy About', () => {
    it('User should be able to navigate to the about site', () => {
        cy.visit('/about')
        cy.contains(/about/i);
    });
})
