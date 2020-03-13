import React from 'react';
import {registry} from '@jahia/ui-extender';
import {ReduxProvider} from './ReduxProvider';
import {batchDispatchMiddleware} from 'redux-batched-actions';
import thunk from 'redux-thunk';

registry.add('callback', 'redux', {
    targets: ['jahiaApp-init:99'],
    callback: () => {
        const reducersArray = registry.find({type: 'redux-reducer', target: 'root'});
        if (reducersArray.length > 0) {
            registry.add('redux-middleware', 'batch', {targets: ['root:1'], middleware: batchDispatchMiddleware});
            registry.add('redux-middleware', 'thunk', {targets: ['root:2'], middleware: thunk});

            const middlewares = registry.find({type: 'redux-middleware'});
            const listeners = registry.find({type: 'redux-listener'});
            const reducers = registry.find({type: 'redux-reducer', target: 'root'});

            registry.add('app', 'redux', {
                targets: ['root:1'],
                render: next => (
                    <ReduxProvider reducers={reducers}
                                   listeners={listeners}
                                   middlewares={middlewares}
                    >{next}
                    </ReduxProvider>
                )
            });
        }
    }
});
