import fetch from 'cross-fetch'
import { ApolloClient, HttpLink, InMemoryCache, from, ApolloLink, NormalizedCacheObject } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

/*
    Note: This code to be compatible with both browser and nodeJS, this means:
        - not using btoa() but Buffer.from().toString('base64') instead
        - using "fetch" with apollo

    Please also note that node does NOT have access to `Cypress.`, thus those cannot be used here
*/

interface AuthMethod {
    token?: string
    username?: string
    password?: string
    jsessionid?: string
}

interface httpHeaders {
    authorization?: string
    Cookie?: string
}

export const apollo = (
    baseUrl: string,
    authMethod?: AuthMethod,
    source?: string,
): ApolloClient<NormalizedCacheObject> => {
    const httpLink = new HttpLink({
        uri: `${baseUrl}/modules/graphql`,
        fetch,
    })

    const authHeaders: httpHeaders = {}
    if (authMethod === undefined) {
        console.log('Performing GraphQL query as guest')
    } else if (authMethod.token !== undefined) {
        authHeaders.authorization = `APIToken ${authMethod.token}`
    } else if (authMethod.username !== undefined && authMethod.password !== undefined) {
        authHeaders.authorization = `Basic ${Buffer.from(authMethod.username + ':' + authMethod.password).toString(
            'base64',
        )}`
    } else if (authMethod.jsessionid !== undefined) {
        console.log(`Performing GraphQL query using JSESSIONID`)
        authHeaders.Cookie = 'JSESSIONID=' + authMethod.jsessionid
    }

    const authLink = setContext((_, { headers }) => {
        const refHeader = source === 'node' ? { Referer: baseUrl } : {}
        return {
            headers: {
                ...headers,
                ...refHeader,
                ...authHeaders,
            },
        }
    })

    return new ApolloClient({
        link: from([authLink as unknown as ApolloLink, httpLink]),
        cache: new InMemoryCache(),
        defaultOptions: {
            query: {
                fetchPolicy: 'no-cache',
                errorPolicy: 'all',
            },
            mutate: {
                errorPolicy: 'all',
            },
        },
    })
}
