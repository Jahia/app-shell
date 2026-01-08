// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:

import './commands'

// Ensure fetch is always bound to window
// https://jahia.slack.com/archives/C013L6U35RA/p1739269102955659
if (typeof window !== 'undefined' && window.fetch) {
    globalThis.fetch = window.fetch.bind(window);
}

require('cypress-terminal-report/src/installLogsCollector')({
    xhr: {
        printHeaderData: true,
        printRequestData: true
    },
    enableExtendedCollector: true,
    collectTypes: ['cons:log', 'cons:info', 'cons:warn', 'cons:error', 'cy:log', 'cy:xhr', 'cy:request', 'cy:intercept', 'cy:command']
});

require('@jahia/cypress/dist/support/registerSupport').registerSupport();

Cypress.on('uncaught:exception', () => {
    // Returning false here prevents Cypress from
    // failing the test
    return false;
});

if (Cypress.browser.family === 'chromium') {
    Cypress.automation('remote:debugger:protocol', {
        command: 'Network.enable',
        params: {}
    });
    Cypress.automation('remote:debugger:protocol', {
        command: 'Network.setCacheDisabled',
        params: {cacheDisabled: true}
    });
}

Cypress.on('test:after:run', (test, runnable) => {
    // Add screenshots, video only for failed tests
    if (test.state === 'failed') {
        const videoFileName = Cypress.spec.relative
            .replace('/.cy.*', '')
            .replace('cypress/e2e/', '');
        addContext({test}, `videos/${videoFileName}.mp4`);

        const screenshotFolderName = Cypress.spec.relative.replace('cypress/e2e/', '');
        const screenshotFileName = `${runnable.parent.title} -- ${test.title} (failed).png`;
        addContext({test}, `screenshots/${screenshotFolderName}/${screenshotFileName}`);
    }
});
