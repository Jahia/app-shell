// Moonstone's CJS build requires its own stylesheet (dist/legacy-global-bundle.css), which
// jest cannot parse. Stylesheets and font/image assets carry no meaning in these tests.
// Replaces the styleMock that used to come from @jahia/test-framework.
module.exports = {};
