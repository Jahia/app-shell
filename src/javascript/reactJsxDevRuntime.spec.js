import {Fragment as runtimeFragment, jsx, jsxs} from 'react/jsx-runtime';
import {Fragment, jsxDEV} from './reactJsxDevRuntime';

// This shim is what a production app-shell shares to remotes under the
// `react/jsx-dev-runtime` federation key, because React's own production build of that
// entry point exports `jsxDEV: undefined`. If jsxDEV ever stops being a callable that
// mirrors jsx/jsxs, every remote compiled with the development JSX runtime breaks.
describe('react/jsx-dev-runtime shim', () => {
    it('should expose jsxDEV as a function', () => {
        expect(typeof jsxDEV).toBe('function');
    });

    it('should re-export Fragment from the production runtime', () => {
        expect(Fragment).toBe(runtimeFragment);
    });

    it('should delegate to jsx for dynamic children', () => {
        expect(jsxDEV('div', {className: 'x', children: 'hi'}, 'k', false))
            .toEqual(jsx('div', {className: 'x', children: 'hi'}, 'k'));
    });

    it('should delegate to jsxs for static children', () => {
        const props = {children: ['a', 'b']};
        expect(jsxDEV('ul', props, 'k', true)).toEqual(jsxs('ul', props, 'k'));
    });

    it('should ignore the dev-only source and self arguments', () => {
        const source = {fileName: 'x.jsx', lineNumber: 1};
        expect(jsxDEV('div', {}, undefined, false, source, {}))
            .toEqual(jsx('div', {}, undefined));
    });

    it('should produce a valid React element carrying the key', () => {
        const el = jsxDEV('div', {children: 'hi'}, 'my-key', false);
        expect(el.type).toBe('div');
        expect(el.key).toBe('my-key');
        expect(el.props.children).toBe('hi');
    });
});
