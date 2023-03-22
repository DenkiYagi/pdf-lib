# Release Process

## Pre-release

1.  Run `git switch denkiyagi-fork && git pull origin denkiyagi-fork`
2.  Update version number in `package.json` (if not yet updated)
3.  Remove directory `node_modules` and then run `yarn install`
4.  Run `yarn release:prep`
5.  Run integration tests:
    - Run `yarn apps:node 'Preview'`
    - Run `yarn apps:node 'Adobe Acrobat'` (on Windows, passing app name does not work for now)
    - Run `yarn apps:web` and open <http://localhost:8080/apps/web/test1.html> with any browser to be tested
6.  Run `git commit -am 'Bump version to X.Y.Z'` (if not yet committed)
7.  Run `git push origin denkiyagi-fork` (if not yet pushed)

Regarding steps 2, 6 and 7, follow another process if you do not have push permission.

## Release

1.  (Prepare `.npmrc` if needed, according to your situation)
2.  Run `npm publish`

## Post-release

1.  Add version tag such as `v1.17.1-mod.2023.3`
