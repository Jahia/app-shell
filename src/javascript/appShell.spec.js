jest.mock('@jahia/ui-extender', () => {
    return {
        registry: {
            find: jest.fn(() => {
                return [];
            })
        }
    };
});

jest.mock('react-dom', () => {
    return {
        render: jest.fn((cmp, target, cb) => cb())
    };
});

jest.mock('./jsloader', () => {
    return {
        jsload: jest.fn()
    };
});

import {startAppShell} from './appShell';
import {registry} from '@jahia/ui-extender';
import {jsload} from './jsloader';

describe('appShell', () => {
    let consoleError;
    beforeEach(() => {
        console.error = jest.fn();
        jsload.mockReset();
        const loader = document.createElement('div');
        loader.classList.add('jahia-loader');
        document.body.appendChild(loader);
    });

    afterEach(() => {
        console.error = consoleError;
    });

    it('should load all file in params', async () => {
        await startAppShell(['./apollo/matcher', 'tata.js'], 'targetId');
        expect(jsload).toHaveBeenCalledWith('./apollo/matcher');
        expect(jsload).toHaveBeenCalledWith('tata.js');
    });

    it('should display an error when a loader is faling', async () => {
        jsload.mockImplementation(() => Promise.reject(new Error('file not exist')));
        await startAppShell(['./fileThatDontExist.js'], 'targetId');
        expect(console.error).toHaveBeenCalled();
    });

    it('should call each callback in the same order when no priority is set', async () => {
        const cbCallOrder = [];
        registry.find.mockImplementation(search => {
            if (search.type === 'callback') {
                return [
                    {callback: () => Promise.resolve(cbCallOrder.push(1))},
                    {callback: () => Promise.resolve(cbCallOrder.push(2))},
                    {callback: () => Promise.resolve(cbCallOrder.push(3))}
                ];
            }

            return [];
        });

        await startAppShell(['./apollo/matcher'], 'targetId');

        expect(cbCallOrder).toEqual([1, 2, 3]);
    });

    it('should call fail if priorty is not respected', async () => {
        const cbCallOrder = [];
        registry.find.mockImplementation(search => {
            if (search.type === 'callback') {
                return [
                    {
                        callback: () => {
                            expect(cbCallOrder).toEqual([3]);
                            cbCallOrder.push(1);
                            return Promise.resolve();
                        },
                        priority: 2
                    },
                    {
                        callback: () => {
                            expect(cbCallOrder).toEqual([3, 1]);
                            cbCallOrder.push(2);
                            return Promise.resolve();
                        }
                    },
                    {
                        callback: () => {
                            cbCallOrder.push(3);
                            return Promise.resolve();
                        },
                        priority: '1'
                    }
                ];
            }

            return [];
        });

        await startAppShell(['./apollo/matcher'], 'targetId');

        expect(cbCallOrder).toEqual([3, 1, 2]);
        expect(console.error).not.toHaveBeenCalled();
    });

    it('should remove the loading when Everything is loaded', async () => {
        await startAppShell([], 'targetId');

        expect(document.querySelector('.jahia-loader')).not.toBeTruthy();
    });

    it('should remove the loading when error occur', async () => {
        await startAppShell([], 'targetId');
        jsload.mockImplementation(() => Promise.reject(new Error('file not exist')));

        expect(document.querySelector('.jahia-loader')).not.toBeTruthy();
    });
});
