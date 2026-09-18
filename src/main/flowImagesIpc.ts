import { ipcMain, dialog, BrowserWindow } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { ensureImagesDir, ensurePreviewImagesDir, getImagesDir, getPreviewImagesDir } from './flowsDirectory';
import { FLOWS_CHANNELS } from '../shared/flowsApi';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/bmp': 'bmp',
  'image/svg+xml': 'svg',
};

const MIME_BY_EXTENSION: Record<string, string> = Object.fromEntries(
  Object.entries(EXTENSION_BY_MIME).map(([mime, extension]) => [extension, mime]),
);

const DIALOG_EXTENSIONS = Object.values(EXTENSION_BY_MIME);

const SAFE_IMAGE_FILENAME_PATTERN = /^[a-z0-9-]+\.(png|jpe?g|gif|webp|bmp|svg)$/i;
const SAFE_SLUG_PATTERN = /^[a-z0-9-]+$/;

function toRelativePath(filename: string): string {
  return path.posix.join('images', filename);
}

// Resolves a stored relative path to an absolute one, rejecting anything
// that isn't a plain "images/<uuid>.<ext>" filename — the path travels
// through the flow JSON and back out over IPC, so it can't be trusted.
function resolveImagePath(relativePath: string): string {
  const filename = path.basename(relativePath);
  if (!SAFE_IMAGE_FILENAME_PATTERN.test(filename) || toRelativePath(filename) !== relativePath) {
    throw new Error(`Invalid image path: "${relativePath}"`);
  }
  return path.join(getImagesDir(), filename);
}

async function writeImageFile(bytes: Buffer, extension: string): Promise<string> {
  await ensureImagesDir();
  const filename = `${crypto.randomUUID()}.${extension}`;
  await fs.writeFile(path.join(getImagesDir(), filename), bytes);
  return toRelativePath(filename);
}

export function registerFlowImagesIpc(): void {
  ipcMain.handle(FLOWS_CHANNELS.selectImage, async (event): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const result = await dialog.showOpenDialog(window, {
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: DIALOG_EXTENSIONS }],
    });
    if (result.canceled || result.filePaths.length === 0) return null;

    const sourcePath = result.filePaths[0];
    const extension = path.extname(sourcePath).slice(1).toLowerCase();
    if (!MIME_BY_EXTENSION[extension]) {
      throw new Error(`Unsupported image type: "${extension}"`);
    }
    const bytes = await fs.readFile(sourcePath);
    return writeImageFile(bytes, extension);
  });

  ipcMain.handle(
    FLOWS_CHANNELS.saveImageData,
    async (_event, bytes: ArrayBuffer, mimeType: string): Promise<string> => {
      const extension = EXTENSION_BY_MIME[mimeType];
      if (!extension) {
        throw new Error(`Unsupported image type: "${mimeType}"`);
      }
      return writeImageFile(Buffer.from(bytes), extension);
    },
  );

  ipcMain.handle(FLOWS_CHANNELS.readImage, async (_event, relativePath: string): Promise<string> => {
    const filePath = resolveImagePath(relativePath);
    const bytes = await fs.readFile(filePath);
    const extension = path.extname(filePath).slice(1).toLowerCase();
    const mimeType = MIME_BY_EXTENSION[extension] ?? 'application/octet-stream';
    return `data:${mimeType};base64,${bytes.toString('base64')}`;
  });

  ipcMain.handle(FLOWS_CHANNELS.deleteImage, async (_event, relativePath: string): Promise<void> => {
    const filePath = resolveImagePath(relativePath);
    await fs.rm(filePath, { force: true });
  });

  ipcMain.handle(FLOWS_CHANNELS.savePreviewImage, async (_event, slug: string, bytes: ArrayBuffer): Promise<void> => {
    if (!SAFE_SLUG_PATTERN.test(slug)) {
      throw new Error(`Invalid flow slug: "${slug}"`);
    }

    await ensurePreviewImagesDir();
    const filePath = path.join(getPreviewImagesDir(), `${slug}.png`);
    const nextBytes = Buffer.from(bytes);

    // Avoid touching the file (and creating noisy repo changes) when the
    // rasterized preview is byte-for-byte identical to the existing PNG.
    try {
      const currentBytes = await fs.readFile(filePath);
      if (currentBytes.equals(nextBytes)) return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT') throw error;
    }

    await fs.writeFile(filePath, nextBytes);
  });
}
