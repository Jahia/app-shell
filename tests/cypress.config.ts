import {defineConfig} from 'cypress';

export default defineConfig({
    chromeWebSecurity: false,
    requestTimeout: 10000,
    responseTimeout: 10000,
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'reporter-config.json'
    },
    video: true,
    screenshotsFolder: './results/screenshots',
    videosFolder: './results/videos',
    viewportWidth: 1366,
    viewportHeight: 768,
    trashAssetsBeforeRuns: true,
    watchForFileChanges: false,
    e2e: {
        experimentalRunAllSpecs: true,
        // We've imported your old cypress plugins here.
        // You may want to clean this up later by importing these.
        setupNodeEvents(on, config) {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require('./cypress/plugins/index.js')(on, config);
        },
        baseUrl: 'http://localhost:8080',
        excludeSpecPattern: ['**/*.ignore.ts']
    }
});
