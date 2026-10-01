# Aqua

Aqua by TechBoy is a privacy-first browser extension that captures accepted LeetCode submissions and commits them to a selected GitHub repository. **Solve. Flow. Sync.**

## Features

- Real GitHub OAuth Device Flow authentication (no backend, no embedded secret)
- Accepted-only LeetCode detection with an isolated, observable adapter
- Configurable repository, branch, folders, README generation, duplicate behavior, commits, and notifications
- Real GitHub Contents API uploads, durable retry queue, and local sync history
- Native MV3 builds for Chrome, Edge, Brave, Opera, Vivaldi, and other Chromium browsers, plus Firefox. A Safari Web Extension source package is included for Xcode conversion.

## Development

```sh
npm install
npm run typecheck && npm run lint && npm test
npm run build
```

Create a GitHub OAuth App and configure its client ID in Aqua Settings. The app must enable Device Flow; Aqua requests `repo` because that is GitHub's scope needed to write private or public selected repositories. No client secret belongs in an extension.

## Load locally

- Chrome, Edge, Brave, Opera, Vivaldi, and Chromium: enable each browser's extension developer mode, then load the matching `dist/<browser>` folder. Any Chromium browser can load `dist/chrome` if a named build is not supplied.
- Firefox: open `about:debugging#/runtime/this-firefox`, Load Temporary Add-on, and choose `dist/firefox/manifest.json`.
- Safari: Safari extensions are signed app extensions, so Apple requires a macOS/Xcode conversion step. Run `npm run build:safari-source`, move `dist/safari-source` to a Mac, and use `xcrun safari-web-extension-converter dist/safari-source --project-location ./SafariAqua --app-name Aqua`. Open the generated Xcode project, sign it, and run it. This is Safari's native distribution mechanism, not a Chrome compatibility layer.

## Browser compatibility

The shared runtime exclusively uses standard WebExtension APIs (`storage`, `runtime`, `tabs`, `notifications`, and content scripts). Chromium-family browsers use the identical MV3 package; Firefox uses its small manifest adaptation. Safari needs its Apple-required native app wrapper, but its extension payload is the same source package. Browser-specific manifests are intentionally limited to packaging differences.

## How it works

On LeetCode problem pages, Aqua observes result UI changes. Once it can find an accepted result and the submitted editor source, it sends only that solution metadata to the extension service worker. The worker creates/updates the solution and optional README through GitHub's REST API.

## Limitations / manual testing

LeetCode frequently changes its UI, so test an accepted submission against the current site and update the adapter selectors if necessary. The OAuth Device Flow requires your own registered GitHub OAuth App client ID. The `Ask before updating` option is stored as a choice but needs a future foreground confirmation UI; it currently performs an update only when the explicit update option is selected.

## Security and privacy

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md). Do not commit built directories or credentials.

## Roadmap

More coding-platform adapters, richer conflict UI, and multi-repository routing.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT.
