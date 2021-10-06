describe('Traging strategy Home', () => {

    beforeEach(() => {
        cy.visit('/ethereum/uniswap-v2/ZRX-WETH');
    })

    it('should render Home with navbar with 3 elements', () => {
        cy.contains('ETH-ZRX trading on Uniswap v2 on Ethereum')
    });

});
