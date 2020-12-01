import { BasePage } from './base.page'

class DashboardPage extends BasePage {
    goTo() {
        cy.goTo('/jahia/dashboard')
        return this
    }
}

export const dashboard = new DashboardPage()
