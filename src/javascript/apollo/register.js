import React from 'react';
import {registry} from '@jahia/ui-extender';
import {ApolloProvider} from 'react-apollo';
import {client} from './client';

const apolloClient = client({
    contextPath: window.contextJsParameters.contextPath,
    useBatch: true,
    httpOptions: {batchMax: 20}
});

registry.add('app', 'apollo-provider', {
    targets: ['root:12'],
    render: next => {
        return <ApolloProvider client={apolloClient}>{next}</ApolloProvider>;
    }
});
