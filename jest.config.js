const jestConfig = require('@jahia/test-framework').jestConfig;
jestConfig.testEnvironment = 'jsdom';
jestConfig.setupFilesAfterEnv = ['<rootDir>/setup-jest.js'];
// Mirror the webpack alias so react-apollo's transitive `apollo-client` require resolves (see webpack.config.js)
jestConfig.moduleNameMapper = {
    ...jestConfig.moduleNameMapper,
    '^apollo-client$': '@apollo/client'
};
module.exports = jestConfig;
