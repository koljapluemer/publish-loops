# loop-manager

A personal, single-screen Electron app for building flow charts with automatically generated image previews.

Each flow chart is a JSON file stored under the configured data path — those files are the source of truth, not any in-app database.

## Requirements

- Node.js and npm

## Running the app

```bash
npm install
cp config.example.yml config.yml
# Set basePath in config.yml to a data directory outside this repository.
npm start
```

This runs the app in dev mode via Electron Forge, which is the only supported way to run it (see [Notes](#notes) below).

With [just](https://github.com/casey/just) installed, `just dev` does the same (running `npm install` first).

## Installing on Linux

```bash
just reinstall
```

Builds a `.deb` (Ubuntu/Debian) or `.rpm` (Fedora, installs `rpm-build` if missing) via Electron Forge, then (re)installs it with `sudo`. The distro is detected from `/etc/os-release`. The package installs the desktop entry and the icon from [`icons/`](./icons).

An installed app can't read `config.yml` from the repo, so it reads `~/.config/loop-manager/config.yml` instead (`$XDG_CONFIG_HOME` is respected). `just reinstall` copies your repo `config.yml` there if none exists yet.

## Usage

- **Top toolbar**: pick a flow chart from the dropdown, or click the `+` icon to create a new one (just give it a name).
- **Edit mode**: drag nodes by their grip handle, type node text in the textarea, drag from a node's edge to another node to connect them, and click an edge to edit its label. Click the `+` button on the canvas to add a new node.
- **Preview mode**: a minimal, chrome-free view where node text renders as Markdown. Opening it automatically writes a square, transparent WebP (1080–4096 px, fit to the flow) to `<basePath>/flow-images/<flow-slug>.webp` in the background.

Changes autosave to disk a short moment after you stop editing — there's no save button.

## Preview image styling

The CSS that controls how flow charts render in preview images lives in [`src/export-flow.css`](./src/export-flow.css). Edit that file to change rendered node cards, Markdown text, images, edge paths, and edge labels.

## Other scripts

```bash
npm run typecheck  # TypeScript type-checking
npm run lint        # ESLint
npm run package      # package the app (not the primary use case, see below)
npm run make          # build platform installers (not the primary use case, see below)
```

## Published loops

Toggle **Published** in edit mode to mark a flow for the website. This repo does not build any
HTML; the koljasam.com static site generator reads the data directly:

- `<basePath>/flows/<slug>.json`: `name`, `published`, nodes, edges
- `<basePath>/flow-images/<slug>.webp`: the preview image (written when a flow is opened in preview mode)

## Notes

- `config.yml` is local and gitignored. Set its required `basePath` to a data directory outside this repository. `~` and `~/...` expand to your home directory; relative paths resolve from the project root. The app creates `flows/`, `flows/images/`, and `flow-images/` beneath it as needed.
- Flow files are plain JSON containing node positions, text, edges, and labels.
