# Extend UI

With the regitry called ui-extender you can do a lot of things:

## Register a root component

You may need a component available at the root of the react app, like a context provider.
For this you should use the `app` namespace with targeting the `root`.


Example to add a provider:

```jsx
import {registry} from '@jahia/ui-extender';

registry.add('app', 'acme-provider', {
    targets: ['root:50'],
    render: next => {
      return (
        <AcmeProvider value={{bipBip: 'fast', coyote: 'fail'}}>
         {next}
        </AcmeProvider>
      );
    }
});
```

## Register a top level root

For this you should use the `route` namespace with targeting the `main`.

```
import {registry} from '@jahia/ui-extender';

registry.add('route', 'content-editor-edit-route', {
    targets: ['main:50'],
    path: '/acme-space/:lang/edit/:uuid',
    render: ({match}) => (
      <AcmeSpace
          uuid={match.params.uuid}
          mode={Constants.routes.baseEditRoute}
          lang={match.params.lang}
          />
    )
});
```

In the future other target will exist and will be documented here

## Register an action

Action allow you to override or add new feature. All action use the `action` namespace, only the target will change.

For example, if you want to add a new entry in publish menu you can do that:

```
import {registry} from '@jahia/ui-extender';

registry.add('action', 'publish', {
    buttonIcon: () => <svg><circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/></svg>,
    buttonLabel: 'Send warning email that content is not translated in german',
    buttonLabelShort: 'Warn missing DE',
    targets: ['publishMenu:5']
});
```

All target available will be documented soon.

## API

[See specific documentation here](https://github.com/Jahia/javascript-components/tree/master/packages/ui-extender)
