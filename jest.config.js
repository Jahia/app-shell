const jestConfig = require('@jahia/test-framework').jestConfig;
jestConfig.testEnvironment = 'jsdom';
jestConfig.setupFilesAfterEnv = ['<rootDir>/setup-jest.js'];
// Mirror the webpack alias so react-apollo's transitive `apollo-client` require resolves (see webpack.config.js)
jestConfig.moduleNameMapper = {
    ...jestConfig.moduleNameMapper,
    '^apollo-client$': '@apollo/client',
    // @jahia/ui-extender 2 is ESM-only: its `exports` map offers no `require` condition,
    // so point jest straight at the entry and let babel transform it (see below).
    '^@jahia/ui-extender$': '<rootDir>/node_modules/@jahia/ui-extender/dist/index.js'
};

// node_modules is not transformed by default, which leaves the ESM entry above unusable.
jestConfig.transformIgnorePatterns = ['/node_modules/(?!@jahia/ui-extender/)', '\\.pnp\\.[^\\/]+$'];
module.exports = jestConfig;
