describe('Traging strategy Pair Details', () => {

    beforeEach(() => {
        cy.visit('/ethereum/uniswap-v2/ZRX-WETH');
    })

    it('has a navigation about link', () => {
        cy.contains(/about/i);
        cy.get('.navbar-nav li')
            .first()
            .should('have.text', 'About')
    });

});
