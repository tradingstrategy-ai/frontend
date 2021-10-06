describe('Traging strategy Home', () => {

    beforeEach(() => {
        cy.visit('/community');
    })

    it('should render Home with navbar with 3 elements', () => {
        cy.contains(/Community/i).should('be.visible');
    });

})
