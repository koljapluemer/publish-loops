# loop-manager

A personal, single-screen Electron app for building flow charts and exporting them as images.

Each flow chart is a JSON file stored in the [`flows/`](./flows) folder (created automatically on first run) — that folder is the source of truth, not any in-app database.

## Requirements

- Node.js and npm

## Running the app

```bash
npm install
npm start
```

This runs the app in dev mode via Electron Forge, which is the only supported way to run it (see [Notes](#notes) below).

## Usage

- **Top toolbar**: pick a flow chart from the dropdown, or click the `+` icon to create a new one (just give it a name).
- **Edit mode**: drag nodes by their grip handle, type node text in the textarea, drag from a node's edge to another node to connect them, and click an edge to edit its label. Click the `+` button on the canvas to add a new node.
- **Preview mode**: a minimal, chrome-free view where node text renders as Markdown — this is what gets exported.
- **Export button**: available in preview mode, exports the current canvas to a PNG.

Changes autosave to disk a short moment after you stop editing — there's no save button.

## Other scripts

```bash
npm run typecheck  # TypeScript type-checking
npm run lint        # ESLint
npm run package      # package the app (not the primary use case, see below)
npm run make          # build platform installers (not the primary use case, see below)
```

## Notes

- This is a personal-use, dev-only tool. Flow chart JSON files are read/written relative to the project root (`app.getAppPath()`), which only resolves correctly when running unpackaged via `npm start`. `npm run package`/`npm run make` are not a supported way to use this app.
- `flows/*.json` files are plain JSON (node positions, text, edges, labels) and are meant to be committed to this repo alongside the code.
