import { dashboard } from '../page-object/dashboard.page'

describe('Navigation to the Dashboard', () => {
    it('Verifies a Welcome and Documentation sections are present', function () {
        dashboard.goTo()
        dashboard.getByText('p', 'Welcome').should('be.visible')
        dashboard.getByText('p', 'Documentation').should('be.visible')
    })
})
