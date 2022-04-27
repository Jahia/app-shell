import {visit} from 'graphql';
import {checkDocument, isField} from '@apollo/client/utilities';

const autoAddedFields = {
    'query/jcr': ['workspace']
};

export var addMissingFields = function (doc) {
    const context = [];
    return visit(checkDocument(doc), {
        OperationDefinition: {
            enter(node) {
                context.push(node.operation);
            },
            leave() {
                context.pop();
            }
        },
        FragmentDefinition: {
            enter(node) {
                context.push(node.name.value);
            },
            leave() {
                context.pop();
            }
        },
        Field: {
            enter(node) {
                context.push(node.name.value);
            },
            leave() {
                context.pop();
            }
        },
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

                const fieldsToAdd = [];

                let shouldAddField = fieldName => (!selections.some(function (selection) {
                    return (isField(selection) &&
                        (selection.name.value === fieldName || selection.name.value.lastIndexOf('__', 0) === 0));
                }));

                // If this SelectionSet is @export-ed as an input variable, it should
                // not have a __typename field (see issue #4691).
                const field = parent;
                if (isField(field) && field.directives && field.directives.some(d => d.name.value === 'export')) {
                    return;
                }

                if (shouldAddField('__typename')) {
                    fieldsToAdd.push('__typename');
                }

                // Auto-add by full field path
                const current = context.join('/');
                if (autoAddedFields[current]) {
                    fieldsToAdd.push(...autoAddedFields[current].filter(shouldAddField));
                }

                // Auto-add by field name only
                // if (autoAddedFields[parent.name.value]) {
                //     fieldsToAdd.push(...autoAddedFields[parent.name.value].filter(shouldAddField));
                // }

                if (fieldsToAdd.length > 0) {
                    const newSelections = fieldsToAdd.map(fieldName => ({
                        kind: 'Field',
                        name: {
                            kind: 'Name',
                            value: fieldName
                        }
                    }));
                    return {
                        ...node,
                        selections: [...selections, ...newSelections]
                    };
                }

                return node;
            }
        }
    });
};
