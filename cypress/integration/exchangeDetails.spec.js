describe('Traging strategy Exchanges Details', () => {

    beforeEach(() => {
        cy.visit('/market-data/ethereum/uniswap-v2');
    })

    it('should render Home with navbar with 3 elements', () => {
        cy.contains('Uniswap v2 on Ethereum')
    });

    it('should verify table data loads', () => {

    });

    it('should verify table has pagination', () => {

    });

    it('should verify table volume is sorted descending', () => {

    });
});
