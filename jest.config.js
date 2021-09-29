const jestConfig = require('@jahia/test-framework').jestConfig;
jestConfig.testEnvironment = 'jsdom';
module.exports = jestConfig;
