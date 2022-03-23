import {visit} from 'graphql';
import {checkDocument, isField} from '@apollo/client/utilities';

const autoAddedFields = {
    jcr: ['workspace'],
    primaryNodeType: ['name'],
    mixinType: ['name'],
    nodeType: ['name'],
    nodeByUuid: ['uuid', 'workspace'],
    nodesByUuid: ['uuid', 'workspace'],
    nodeByPath: ['uuid', 'workspace'],
    nodesByPath: ['uuid', 'workspace'],
    parent: ['uuid', 'workspace'],
    displayableNode: ['uuid', 'workspace'],
    site: ['uuid', 'workspace']
};

export var addTypenameToDocument = function (doc) {
    return visit(checkDocument(doc), {
        SelectionSet: {
            enter(node, _key, parent) {
                // Don't add [fieldName] to OperationDefinitions.
                if (parent && parent.kind === 'OperationDefinition') {
                    return;
                }

                const {selections} = node;
                if (!selections) {
                    return;
                }

                const fieldNames = autoAddedFields[parent.name.value] ? ['__typename', ...autoAddedFields[parent.name.value]] : ['__typename'];

                // If this SelectionSet is @export-ed as an input variable, it should
                // not have a __typename field (see issue #4691).
                const field = parent;
                if (isField(field) && field.directives && field.directives.some(d => d.name.value === 'export')) {
                    return;
                }

                // If selections already have a [fieldName], or are part of an
                // introspection query, do nothing.
                const newSelections = [];
                fieldNames.forEach(fieldName => {
                    const skip = selections.some(function (selection) {
                        return (isField(selection) &&
                            (selection.name.value === fieldName || selection.name.value.lastIndexOf('__', 0) === 0));
                    });
                    if (!skip) {
                        // Create and return a new SelectionSet with a [fieldName] Field.
                        newSelections.push({
                            kind: 'Field',
                            name: {
                                kind: 'Name',
                                value: fieldName
                            }
                        });
                    }
                });
                return {
                    ...node,
                    selections: [...selections, ...newSelections]
                };
            }
        }
    });
};
