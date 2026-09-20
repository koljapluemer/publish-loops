import { app } from 'electron';
import path from 'node:path';

const ICONS_DIRNAME = 'icons';
const WINDOW_ICON_FILENAME = 'android-chrome-512x512.png';

// Packaged builds ship `icons/` via forge's `extraResource`; dev runs read it from the repo.
function getIconsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, ICONS_DIRNAME)
    : path.join(app.getAppPath(), ICONS_DIRNAME);
}

export function getWindowIconPath(): string {
  return path.join(getIconsDir(), WINDOW_ICON_FILENAME);
}
