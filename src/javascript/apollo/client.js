import {ApolloClient} from 'apollo-client';
import {from, split} from 'apollo-link';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {getMainDefinition, toIdValue} from 'apollo-utilities';

import {dxHttpLink, dxUploadLink, ssrLink} from './links';
import {fragmentMatcher} from './matcher';
import {WebSocketLink} from 'apollo-link-ws';

const client = function (options) {
    options = options || {};

    let ssrMode = (typeof window === 'undefined');

    // Map of path/uuid to be able to resolve cache key when we only have the path during cache resolving
    let idByPath = {};

    // Get final cacke Key
    let getId = (workspace, uuid) => toIdValue(normalizeId(workspace, uuid));

    // Get formated cache key
    let normalizeId = (workspace, uuid) => workspace + ':' + uuid;

    let dataIdFromObject = data => {
        // Use dataIdFromObject() from the options if provided
        if (options.dataIdFromObject) {
            let r = options.dataIdFromObject(data);
            if (r) {
                return r;
            }
        }

        // In order to cache JCR node we need at least uuid and workspace fields
        if (data.uuid && data.workspace) {
            if (data.path) {
                // Store key for path, in case queryNodeByPath is used in the future we can resolve the appropriate ID
                idByPath[data.path] = data.uuid;
            }

            return normalizeId(data.workspace, data.uuid);
        }

        // Use default apollo cache key
        if (data.__typename && data.id) {
            return normalizeId(data.__typename, data.id);
        }

        return undefined;
    };

    let cacheRedirects = {
        JCRQuery: {
            nodeById: (_, args) => {
                if (_.workspace) {
                    return getId(_.workspace, args.uuid);
                }
            },
            nodesById: (_, args) => {
                if (_.workspace) {
                    return args.uuids.map(function (uuid) {
                        return getId(_.workspace, uuid);
                    });
                }
            },
            nodeByPath: (_, args) => {
                if (_.workspace && idByPath[args.path]) {
                    return getId(_.workspace, idByPath[args.path]);
                }
            },
            nodesByPath: (_, args) => {
                if (_.workspace) {
                    let f = args.paths.map(path => (idByPath[path] ? getId(_.workspace, idByPath[path]) : undefined));
                    return f.indexOf(undefined) === -1 ? f : undefined;
                }
            }
        }
    };

    // Add JCRNode cache resolvers:
    for (let typeName of fragmentMatcher.possibleTypesMap.JCRNode) {
        cacheRedirects[typeName] = {
            nodeInWorkspace: (_, args) => {
                if (_.uuid) {
                    return getId(args.workspace, _.uuid);
                }
            }
        };
    }

    if (options.cacheRedirects) {
        Object.assign(cacheRedirects, options.cacheRedirects);
    }

    let cache = new InMemoryCache({
        fragmentMatcher: fragmentMatcher,
        dataIdFromObject: dataIdFromObject,
        cacheRedirects: cacheRedirects
    });

    cache.flushNodeEntryByPath = (path, workspace = 'EDIT') => {
        let cacheKey = cacheRedirects.JCRQuery.nodeByPath({workspace}, {path});

        return flushNodeEntry(cacheKey);
    };

    cache.flushNodeEntryById = (uuid, workspace = 'EDIT') => {
        let cacheKey = cacheRedirects.JCRQuery.nodeById({workspace}, {uuid});

        return flushNodeEntry(cacheKey);
    };

    cache.idByPath = idByPath;

    const wsLink = new WebSocketLink({
        uri: 'ws://' + location.host + (options.contextPath ? options.contextPath : '') + '/modules/graphql',
        options: {
            reconnect: true
        }
    });

    const flushNodeEntry = cacheKey => {
        if (cacheKey) {
            let strings = Object.keys(cache.data.data).filter(key => key.match(new RegExp('.*' + cacheKey.id + '.*')));
            strings.forEach(key => cache.data.delete(key));
            return strings.length;
        }

        return 0;
    };

    let httpLink = from([dxUploadLink, dxHttpLink(options.contextPath ? options.contextPath : '', options.useBatch, options.httpOptions)]);

    let link = split(
        // Split based on operation type
        ({query}) => {
            const {kind, operation} = getMainDefinition(query);
            return kind === 'OperationDefinition' && operation === 'subscription';
        },
        wsLink,
        httpLink
    );
    return new ApolloClient({
        link: ssrMode ? ssrLink : (options.link ? options.link : link),
        cache: cache,
        ssrMode: ssrMode
    });
};

export {client};
