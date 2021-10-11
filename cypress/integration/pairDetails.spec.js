describe('Traging strategy Pair Details', () => {

    beforeEach(() => {
        cy.visit('/market-data/ethereum/uniswap-v2/eth-usdt');
    })

    it('has a navigation about link', () => {
        cy.contains(/ETH-USDT trading on Uniswap v2 on Ethereum/i);
        cy.get('.navbar-nav li')
            .first()
            .should('have.text', 'Market data')
    });

});
