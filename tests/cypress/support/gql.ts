/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import Chainable = Cypress.Chainable
import { apollo } from './apollo'

export const deleteNode = (
    pathOrId: string,
    apolloClient: ApolloClient<NormalizedCacheObject> = apollo(Cypress.config().baseUrl, {
        username: 'root',
        password: Cypress.env('SUPER_USER_PASSWORD'),
    }),
): Chainable<any> => {
    return cy.apolloMutate(apolloClient, {
        variables: {
            pathOrId: pathOrId,
        },
        errorPolicy: 'all',
        mutation: require(`graphql-tag/loader!../fixtures/jcrDeleteNode.graphql`),
    })
}
