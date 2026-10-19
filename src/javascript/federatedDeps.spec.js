import fs from 'node:fs';
import path from 'node:path';
import shared from '../../webpack.shared';

// The app-shell only wins the version negotiation for the shared modules it loads before
// initializing the remotes (see jahia.js). A key missing from federatedDeps.js is decided by
// the remotes instead, or not provided at all: webpack only provides a key that some module
// of the build imports.
describe('federatedDeps', () => {
    it('should import exactly the modules the app-shell provides to the federation', () => {
        const source = fs.readFileSync(path.join(__dirname, 'federatedDeps.js'), 'utf8');
        const imported = [...source.matchAll(/^import\s[\s\S]+?\sfrom\s+'([^']+)'/gm)].map(match => match[1]);
        const provided = Object.entries(shared)
            .filter(([, config]) => config.import !== false)
            .map(([key]) => key);

        expect(imported.toSorted()).toEqual(provided.toSorted());
    });
});
