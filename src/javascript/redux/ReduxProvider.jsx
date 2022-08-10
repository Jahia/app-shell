import React from 'react';
import {Provider} from 'react-redux';
import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import PropTypes from 'prop-types';

export const ReduxProvider = ({reducers, middlewares, listeners, children}) => {
    const reducerObj = {};
    reducers.forEach(r => {
        reducerObj[r.key] = r.reducer;
    });

    const rootReducer = combineReducers(reducerObj);

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        trace: true,
        traceLimit: 25
    }) || compose;

    const enhancer = composeEnhancers(applyMiddleware.apply(this, middlewares.map(m => m.middleware)));
    const store = createStore(rootReducer, enhancer);

    window.jahia.reduxStore = store;

    listeners.map(l => l.createListener(store)).forEach(l => store.subscribe(l));

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
};

ReduxProvider.propTypes = {
    children: PropTypes.element.isRequired,
    reducers: PropTypes.array.isRequired,
    middlewares: PropTypes.array.isRequired,
    listeners: PropTypes.array.isRequired
};

