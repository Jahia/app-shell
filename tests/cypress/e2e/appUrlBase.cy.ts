describe('Application base URL', () => {
    const urlBaseOf = (appName: string) => {
        cy.visit(`/modules/appshell/${encodeURIComponent(appName)}/home`);
        return cy.window().its('contextJsParameters.urlbase');
    };

    beforeEach(() => {
        cy.login();
    });

    it('Sets the base URL from the application name', () => {
        urlBaseOf('dashboard').should('eq', '/modules/appshell/dashboard');
    });

    it('Keeps special characters of the application name in the base URL', () => {
        ['it\'s', 'say "hi"', 'café & co'].forEach(appName => {
            urlBaseOf(appName).should('eq', `/modules/appshell/${appName}`);
        });
    });
});
