import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import type { MakerDebConfig } from '@electron-forge/maker-deb';
import type { MakerRpmConfig } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

// Installed into the desktop's icon set by the deb/rpm makers; needs a PNG.
const LINUX_PACKAGE_ICON = './icons/android-chrome-512x512.png';
const LINUX_PACKAGE_OPTIONS = {
  icon: LINUX_PACKAGE_ICON,
  categories: ['Graphics'] as ['Graphics'],
};

// deb/rpm are declared by package name (not as instances) so `make --targets=...` finds their config.
const debConfig: MakerDebConfig = { options: LINUX_PACKAGE_OPTIONS };
const rpmConfig: MakerRpmConfig = { options: LINUX_PACKAGE_OPTIONS };

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    extraResource: ['./icons'],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    { name: '@electron-forge/maker-rpm', config: rpmConfig },
    { name: '@electron-forge/maker-deb', config: debConfig },
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
