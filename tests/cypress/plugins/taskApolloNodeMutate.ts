import { DocumentNode } from 'graphql'

import { apollo } from '../support/apollo'

interface authMethod {
    token?: string
    username?: string
    password?: string
    jsessionid?: string
}

interface params {
    authMethod?: authMethod
    baseUrl: string
    mutation: DocumentNode
    variables: Record<string, unknown>
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const apolloNode = async (params: params) => {
    const { baseUrl, authMethod, mutation, variables } = params

    const aClient = apollo(baseUrl, authMethod, 'node')

    return await aClient.mutate({
        mutation: mutation,
        variables: variables,
    })
}

module.exports = apolloNode
