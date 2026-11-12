# `@denkiyagi/pdf-lib` development notes

## Editor setup

If you use VS Code:

`TypeScript: Select TypeScript Version...` -> `Use Workspace Version`

## Package manager

This project uses [pnpm](https://pnpm.io/). The version is pinned by the `packageManager` field in `package.json`.
Make sure the `pnpm` command is available, e.g. by running `corepack enable pnpm` or installing pnpm globally.

- Install dependencies: `pnpm install`

## Before submitting pull request

- Lint and typecheck
    - `pnpm run lint`
    - `pnpm run typecheck`
- Automated tests
    - `pnpm run test`
- Manual integration tests
    - `pnpm run apps:node 'Preview'`
    - `pnpm run apps:node 'Adobe Acrobat'` (on Windows, passing app name does not work for now)
    - `pnpm run apps:web` and open <http://localhost:8080/apps/web/test1.html> with any browser to be tested

## Release

1. Make sure the `denkiyagi-fork` branch on GitHub is up-to-date and ready to publish, including the version.
2. Create a [release](https://docs.github.com/en/repositories/releasing-projects-on-github) on GitHub.  
This triggers an automatic publish to GitHub Packages. See also the [workflow file](.github/workflows/npm-publish-github-packages.yml).
3. Make sure the package has been successfully created:  
<https://github.com/DenkiYagi/pdf-lib/pkgs/npm/pdf-lib>
