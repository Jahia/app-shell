'use strict';

// Inlined instead of using `@jahia/test-framework`'s jestConfig. That package's entry point
// eagerly loads shallowWithTheme -> @material-ui/core (which only existed in the tree via
// @jahia/design-system-kit), and it pulls in enzyme + enzyme-adapter-react-16 -- a React *16*
// adapter that never ran here anyway, because the app-shell always replaced
// setupFilesAfterEnv with its own file.
//
// Every option below is load-bearing; verified by removing each one and re-running:
//   - testEnvironment      -> ReferenceError: window
//   - setupFilesAfterEnv   -> jest-environment-jsdom 30 leaves TextEncoder/TextDecoder
//                             undefined, which the graphql/apollo paths need
//   - apollo-client        -> Cannot find module 'apollo-client' (react-apollo's transitive
//                             require; mirrors the alias in webpack.config.js)
//   - @jahia/ui-extender   -> Cannot find module '@jahia/ui-extender'
// Dropped as provably redundant: a '@jahia/moonstone' mapping -- its exports map already sends
// the `require` condition to dist/index.cjs, the very file that mapping named.
//
// This file is throwaway once the Vite migration replaces jest with vitest.
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
    moduleNameMapper: {
        '^apollo-client$': '@apollo/client',
        // Moonstone's CJS build requires dist/legacy-global-bundle.css, which jest cannot parse.
        '\\.(css|scss|less|woff2?|eot|ttf|svg)$': '<rootDir>/jest-style-mock.js',
        // @jahia/ui-extender 2 is ESM-only -- no `require` condition in its exports map, so
        // jest cannot resolve it, which jest.mock() needs to do even when a factory replaces
        // the module. Every spec passes a factory, so the file is never executed and no
        // transformIgnorePatterns entry is required.
        '^@jahia/ui-extender$': '<rootDir>/node_modules/@jahia/ui-extender/dist/index.js'
    },
    testPathIgnorePatterns: ['<rootDir>/src/main/', '<rootDir>/node/', '<rootDir>/node_modules/', '<rootDir>/target/'],
    verbose: true
};
