import {ApolloClient, from, InMemoryCache, split} from '@apollo/client';
import {getMainDefinition} from '@apollo/client/utilities';
import {dxHttpLink, dxUploadLink, ssrLink} from './links';
import {GraphQLWsLink} from '@apollo/client/link/subscriptions';
import {createClient} from 'graphql-ws';
import {addMissingFields} from './addMissingFields';

const possibleTypes = {
    JCRNode: ['JCRNode', 'GenericJCRNode', 'JCRSite', 'VanityUrl'],
    JCRItemDefinition: ['JCRItemDefinition', 'JCRPropertyDefinition', 'JCRNodeDefinition']
};

const mainType = {};
Object.keys(possibleTypes).forEach(k => {
    possibleTypes[k].forEach(v => {
        mainType[v] = k;
    });
});

let currentWs;

// Map of path/uuid to be able to resolve cache key when we only have the path during cache resolving
let idByPath = {};

let typePolicies = {
    ROOT_QUERY: {
        queryType: true,
        fields: {
            jcr: (existingData, {args, toReference}) => {
                // Field function is only here to set the current workspace
                currentWs = ((args && args.workspace) || 'EDIT');
                return existingData || toReference({__typename: 'JCRQuery', workspace: currentWs});
            }
        }
    },
    GqlPublicationInfo: {
        merge: true
    },
    JCRQuery: {
        fields: {
            nodeById: (existingData, {args, toReference}) =>
                existingData || toReference(getNodeKey(args.uuid, currentWs)),
            nodesById: (existingData, {args, toReference}) =>
                existingData || args.uuids.map(uuid => toReference(getNodeKey(uuid, currentWs))),
            nodeByPath: (existingData, {args, toReference}) =>
                existingData || (idByPath[args.path] && toReference(getNodeKey(idByPath[args.path], currentWs))),
            nodesByPath: (existingData, {args, toReference}) =>
                existingData || (args.paths.every(path => idByPath[path]) && args.paths.map(path => toReference(getNodeKey(idByPath[path], currentWs))))
        }
    }
};

let customTypePolicies = {
    JCRNode: {
        keyFields: ['uuid', 'workspace']
    },
    JCRQuery: {
        keyFields: ['workspace']
    },
    JCRNodeType: {
        keyFields: ['name']
    },
    GqlEditorForms: {
        keyFields: []
    }

};

function getNodeKey(uuid, workspace) {
    return 'JCRNode:' + JSON.stringify({uuid, workspace});
}

const client = function () {
    let ssrMode = (typeof window === 'undefined');

    // Get final cacke Key
    // let getId = (workspace, uuid) => toIdValue(workspace + ':' + uuid);

    // Get formated cache key
    let dataIdFromObject = data => {
        // In order to cache JCR node we need at least uuid and workspace fields
        const type = mainType[data.__typename] ? mainType[data.__typename] : data.__typename;
        if (type === 'JCRNode' && data.path && data.uuid) {
            // Store key for path, in case queryNodeByPath is used in the future we can resolve the appropriate ID
            idByPath[data.path] = data.uuid;
        }

        if (customTypePolicies[type]) {
            let keyFields = customTypePolicies[type].keyFields;
            if (keyFields.every(keyField => data[keyField])) {
                return type + ':' + JSON.stringify(keyFields.reduce((v, keyField) => ({
                    ...v,
                    [keyField]: data[keyField]
                }), {}));
            }

            console.error('Missing fields ' + keyFields + ' while extracting key from ' + data.__typename, data);
        }

        return undefined;
    };

    const cache = new InMemoryCache({
        dataIdFromObject,
        possibleTypes,
        typePolicies
    });

    cache.transformDocument = document => {
        return addMissingFields(document);
    };

    cache.flushNodeEntryByPath = (path, workspace = 'EDIT') => {
        console.log('flushNodeEntryByPath', workspace);
        if (idByPath[path]) {
            cache.evict({id: getNodeKey(idByPath[path], workspace)});
        }
    };

    cache.flushNodeEntryById = (uuid, workspace = 'EDIT') => {
        console.log('flushNodeEntryByPath', workspace);
        cache.evict({id: getNodeKey(uuid, workspace)});
    };

    cache.idByPath = idByPath;

    if (ssrMode) {
        return new ApolloClient({
            link: ssrLink,
            cache,
            ssrMode
        });
    }

    const wsLink = new GraphQLWsLink(createClient({
        url: (location.protocol === 'https:' ? 'wss://' : 'ws://') +
            location.host +
            (window.contextJsParameters.contextPath ? window.contextJsParameters.contextPath : '') +
            '/modules/graphqlws'
    }));

    let link = split(
        // Split based on operation type
        ({query}) => {
            const {kind, operation} = getMainDefinition(query);
            return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        from([dxUploadLink, dxHttpLink])
    );

    return new ApolloClient({link, cache, ssrMode});
};

export {client};
