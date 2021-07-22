/* eslint-disable @typescript-eslint/no-var-requires */
const cypressTypeScriptPreprocessor = require("./cy-ts-preprocessor");
const codeCoverage = require('@cypress/code-coverage/task');
const installLogsPrinter = require('cypress-terminal-report/src/installLogsPrinter');
const taskApolloNodeQuery = require('./taskApolloNodeQuery')
const taskApolloNodeMutate = require('./taskApolloNodeMutate')
const env = require('./env');

module.exports = (on, config) => {
    env(on, config)
    codeCoverage(on, config);
    
    //https://github.com/archfz/cypress-terminal-report
    // eslint-disable-next-line @typescript-eslint/no-var-requires    
    installLogsPrinter(on);
    on("file:preprocessor", cypressTypeScriptPreprocessor);
    on('task', {
        apolloNodeQuery(params) {
            console.log(config.env)
            return taskApolloNodeQuery(params)
        },
    });
    on('task', {
        apolloNodeMutate(params) {
            console.log(config.env)
            return taskApolloNodeMutate(params)
        },
    });     
    return config;
};