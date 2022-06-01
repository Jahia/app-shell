import { DashboardPage } from '../page-object/dashboard.page'

describe('Navigation to the Dashboard', () => {
    it('Verifies a Welcome and Documentation sections are present', function () {
        cy.login()
        const dashboard = DashboardPage.visit()
        cy.contains('p', 'Welcome').should('be.visible')
        cy.contains('p', 'Documentation').should('be.visible')
    })
})
