# Aqua

Aqua by TechBoy (**CHIMATA RAGHURAM**) is a privacy-first, all-in-one browser extension that captures accepted solutions from **LeetCode, GeeksforGeeks, CodeChef, and HackerRank** and commits them automatically to your GitHub repository. **Solve. Flow. Sync.**

## Features

- **Multi-Platform Support**: Automatic accepted-submission detection for **LeetCode**, **GeeksforGeeks**, **CodeChef**, and **HackerRank** (toggle any or all platforms in Settings).
- **Flexible GitHub Connection**: Connect in seconds with a **Personal Access Token** (`repo` scope) or **GitHub OAuth Device Flow** (no backend, no embedded secret).
- **Create or Select Repository**: Create a new Private/Public repository (with an auto-generated root `README.md`) or pick an existing repository and branch.
- **Automatic File Organization**: Saves solutions cleanly under `Coding-Solutions/<Platform>/<Problem>/solution.<ext>` with an auto-generated `README.md` per problem.
- **Progress Tracking Popup**: View total **Problems Solved**, **Easy / Medium / Hard** counts, and per-platform breakdowns (`LC · GfG · CC · HR`) with one-click retry for pending syncs.
- **Cross-Browser MV3**: Native builds for Chrome, Edge, Brave, Opera, Vivaldi, Firefox, and Safari source packaging.

## Project Structure

- `src/frontend/` — React UI (`popup/` and `options/` Settings page)
- `src/backend/` — MV3 service worker (`index.ts`), GitHub REST API client (`github/client.ts`), and local storage (`storage/index.ts`)
- `src/content/` — Platform adapters (`leetcode/`, `geeksforgeeks/`, `codechef/`, `hackerrank/`)
- `src/shared/` — Shared TypeScript types and path/README/commit utilities
- `manifest/` — Browser-specific MV3 manifests
- `tests/` — Vitest unit tests

## Development

```sh
npm install
npm run typecheck
npm run lint
npm test
npm run build:chrome
```

## Load Locally (Chrome)

1. Run `npm run build:chrome`.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select `dist/chrome`.

For Firefox, open `about:debugging#/runtime/this-firefox` and load `dist/firefox/manifest.json`. For Safari, run `npm run build:safari-source` and convert `dist/safari-source` with `xcrun safari-web-extension-converter` on macOS.

## Security and Privacy

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md). All data stays in your browser's local storage and communicates only with GitHub's REST API. Do not commit built directories or credentials.

## Contributing and License

Contributions are welcome! Open a Pull Request on [GitHub](https://github.com/chimataraghuram/Aqua/pulls) or see [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT.
