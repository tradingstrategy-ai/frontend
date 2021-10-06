describe('Traging strategy Home', () => {

    beforeEach(() => {
        cy.visit('/about');
    })

    it('should render Home with navbar with 3 elements', () => {
        cy.contains('About').should('be.visible');
    });

})
