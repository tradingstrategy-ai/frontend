describe('Trading strategy Pair Details', () => {

    beforeEach(() => {
        cy.visit('/trading-view/ethereum/uniswap-v2/eth-usdt');
    })

    it('has a navigation about link', () => {
        cy.contains(/ETH-USDT token pair on Uniswap v2 on Ethereum/i);
        cy.get('.navbar-nav li')
            .first()
            .should('have.text', 'Trading data')
    });

    it('Breadcrumb should be visible and have 1 element', () => {
        cy.get('[data-testid=breadcrumb]')
            .should('be.visible')
            .find('li')
            .should('have.length', 4)
            .contains(/Trading data/i);
    });
});
