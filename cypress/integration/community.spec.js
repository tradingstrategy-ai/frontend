describe('Traging strategy Community', () => {
    it('User should be able to navigate to the about site', () => {
        cy.visit('/community')
        cy.contains(/community/i);
    });
})
