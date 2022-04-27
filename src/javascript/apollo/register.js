import React from 'react';
import {registry} from '@jahia/ui-extender';
import {ApolloProvider} from '@apollo/client/react';
import {ApolloProvider as LegacyApolloProvider} from 'react-apollo';
import {client} from './client';

export const apolloClient = client();

registry.add('app', 'apollo-provider', {
    targets: ['root:12'],
    render: next => {
        return (
            <LegacyApolloProvider client={apolloClient}>
                <ApolloProvider client={apolloClient}>
                    {next}
                </ApolloProvider>
            </LegacyApolloProvider>
        );
    }
});
