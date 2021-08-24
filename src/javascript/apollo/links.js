import {print} from 'graphql';
import {ApolloLink} from 'apollo-link';
import {HttpLink} from 'apollo-link-http';
import {BatchHttpLink} from 'apollo-link-batch-http';
import * as Observable from 'zen-observable';

export const dxUploadLink = new ApolloLink(
    (operation, forward) => {
        let {variables, setContext} = operation;
        let fileFound = false;
        const formData = new FormData();

        // Search for File objects on the request and set it as formData
        Object.keys(variables).forEach(function (k) {
            let variable = variables[k];
            if (variable instanceof File) {
                const id = Math.random().toString(36);
                formData.append(id, variable);
                variables[k] = id;
                fileFound = true;
            }
        });
        if (fileFound) {
            setContext({
                fetchOptions: {formData: formData}
            });
        }

        return forward(operation);
    }
);

export const dxHttpLink = (contextPath, batch, httpOptions) => {
    let Link = batch ? BatchHttpLink : HttpLink;
    return new Link({
        uri: contextPath + '/modules/graphql',
        credentials: 'same-origin',
        fetch: (uri, fetcherOptions) => {
            if (fetcherOptions.formData) {
                let formData = fetcherOptions.formData;
                let body = JSON.parse(fetcherOptions.body);
                if (Array.isArray(body)) {
                    formData.append('query', fetcherOptions.body);
                } else {
                    Object.keys(body).forEach(k => formData.append(k, typeof body[k] === 'string' ? body[k] : JSON.stringify(body[k])));
                }

                fetcherOptions.body = formData;
                delete fetcherOptions.headers['content-type'];
                return fetch(uri, fetcherOptions);
            }

            return fetch(uri, fetcherOptions);
        },
        ...httpOptions
    });
};

export const ssrLink = new ApolloLink(
    operation => {
        let {operationName, variables, query} = operation;
        /* eslint-disable-next-line */
        let res = gqlHelper.executeQuery(print(query), operationName, JSON.stringify(variables));
        return Observable.of(JSON.parse(res));
    }
);
