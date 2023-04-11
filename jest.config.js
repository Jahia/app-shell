const jestConfig = require('@jahia/test-framework').jestConfig;
jestConfig.testEnvironment = 'jsdom';
jestConfig.setupFilesAfterEnv = ['<rootDir>/setup-jest.js'];
module.exports = jestConfig;
