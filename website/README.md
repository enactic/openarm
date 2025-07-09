# Website

https://docs.openarm.dev/ is built using [Docusaurus](https://docusaurus.io/).

## Installation

```bash
cd website
npm install
```

## Local Development

```bash
cd website
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Pull request and preview

You can enable preview on your fork by the following:

1. Enable GitHub Pages on your fork:
   1. Open https://github.com/${YOUR_GITHUB_ACCOUNT}/openarm/settings/pages
   2. Select "GitHub Actions" as "Source"
2. Accept publishing GitHub Pages from all branches on your fork:
   1. Open https://github.com/${YOUR_GITHUB_ACCOUNT}/openarm/settings/environments
   2. Select the "github-pages" environment
   3. Change the default "Deployment branches and tags" rule:
      1. Press the "Edit" button
      2. Change the "Name pattern" to `*` from `main`

You can preview your changes at https://${YOUR_GITHUB_ACCOUNT}.github.io/openarm/ .
