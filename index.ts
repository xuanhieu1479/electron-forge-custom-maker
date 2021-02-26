import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import {
  convertVersion,
  createWindowsInstaller,
  Options as ElectronWinstallerOptions
} from 'electron-winstaller';
import fs from 'fs';
import path from 'path';

type MakerSquirrelConfig = Omit<
  ElectronWinstallerOptions,
  'appDirectory' | 'outputDirectory'
>;

export default class MakerSquirrel extends MakerBase<MakerSquirrelConfig> {
  name = 'FolderTagger';
  defaultPlatforms: ForgePlatform[] = ['win32'];

  isSupportedOnCurrentPlatform(): boolean {
    return this.isInstalled('electron-winstaller');
  }

  async make({
    dir,
    makeDir,
    targetArch,
    packageJSON
  }: MakerOptions): Promise<string[]> {
    const outPath = path.resolve(makeDir, `windows/${targetArch}`);
    await this.ensureDirectory(outPath);

    const winstallerConfig: ElectronWinstallerOptions = {
      name: this.name,
      title: this.name,
      noMsi: true,
      exe: `${this.name}.exe`,
      setupExe: `${this.name}-${packageJSON.version} Setup.exe`,
      ...this.config,
      appDirectory: dir,
      outputDirectory: outPath
    };

    await createWindowsInstaller(winstallerConfig);

    const nupkgVersion = convertVersion(packageJSON.version);
    const artifacts = [
      path.resolve(outPath, 'RELEASES'),
      path.resolve(
        outPath,
        winstallerConfig.setupExe || `${this.name} Setup.exe`
      ),
      path.resolve(
        outPath,
        `${winstallerConfig.name}-${nupkgVersion}-full.nupkg`
      )
    ];
    // For auto updater
    const deltaPath = path.resolve(
      outPath,
      `${winstallerConfig.name}-${nupkgVersion}-delta.nupkg`
    );
    if (winstallerConfig.remoteReleases || fs.existsSync(deltaPath)) {
      artifacts.push(deltaPath);
    }
    return artifacts;
  }
}
