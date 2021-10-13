describe('Traging strategy Exchanges Details', () => {

    beforeEach(() => {
        cy.visit('/trading-view/ethereum/uniswap-v2');
    })

    it('Should show correct title', () => {
        cy.get('[data-test-id=title]').contains('Uniswap v2 on Ethereum');
    });

    it('User can see navigation', () => {
        cy.get('nav').should('be.visible');
    });

    it('statistics should be visible', () => {
        cy.get('[data-test-id=statistics]').should('be.visible');
    });

    it('trading pairs should be visible', () => {
        cy.get('[data-test-id=pairs]').should('be.visible');
    });

    it('Breadcrumb should be visible and have 1 element', () => {
        cy.get('[data-test-id=breadcrumb]').should('be.visible');
        cy.get('[data-test-id=breadcrumb] li')
            .should('have.length', 3)
            .contains(/Trading data/i)
    });
});
