import { DocumentNode } from 'graphql'

import { apollo } from '../support/apollo'

interface AuthMethod {
    token?: string
    username?: string
    password?: string
    jsessionid?: string
    from?: string
}

interface params {
    authMethod?: AuthMethod
    baseUrl: string
    query: DocumentNode
    variables: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const apolloNode = async (params: params) => {
    const { baseUrl, authMethod, query, variables } = params

    const aClient = apollo(baseUrl, authMethod, 'node')

    return await aClient.query({
        query: query,
        variables: variables,
    })
}

module.exports = apolloNode
