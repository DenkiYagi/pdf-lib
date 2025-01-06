# `@denkiyagi/pdf-lib` development notes

## Setup

After cloning the repository and running `yarn install`, you must run the following command manually:

```bash
yarn dev:prep
```

## Before submitting pull request

- Lint and typecheck
    - `yarn lint`
    - `yarn typecheck`
- Automated tests
    - `yarn test`
- Manual integration tests
    - `yarn apps:node 'Preview'`
    - `yarn apps:node 'Adobe Acrobat'` (on Windows, passing app name does not work for now)
    - `yarn apps:web` and open <http://localhost:8080/apps/web/test1.html> with any browser to be tested

## Release

1. Make sure the `denkiyagi-fork` branch on GitHub is up-to-date and ready to publish, including the version.
2. Create a [release](https://docs.github.com/en/repositories/releasing-projects-on-github) on GitHub.  
This triggers an automatic publish to GitHub Packages. See also the [workflow file](.github/workflows/npm-publish-github-packages.yml).
3. Make sure the package has been successfully created:  
<https://github.com/DenkiYagi/pdf-lib/pkgs/npm/pdf-lib>
