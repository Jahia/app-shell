export class BasePage {
    protected BE_VISIBLE = 'be.visible'
    /**
     * Get any element of given type that contain given text
     * It does not require to be the direct element containing text
     * example: <span><div>mytext</div></span> getByText("span", "myText") will work
     * @param type of content to find
     * @param text to find
     */
    getByText(type: string, text: string | RegExp): Cypress.Chainable {
        return cy.contains(type, text)
    }

    assertElementVisibleBySelector(selector: string): Cypress.Chainable {
        return cy.get(selector).should(this.BE_VISIBLE)
    }

    assertButtonVisibleAndClick(selector: string): Cypress.Chainable {
        return cy.get(selector).last().should(this.BE_VISIBLE).click()
    }
}
