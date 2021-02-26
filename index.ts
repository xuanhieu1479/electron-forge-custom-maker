import MakerBase, { MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import {
  convertVersion,
  createWindowsInstaller,
  Options as ElectronWinstallerOptions
} from 'electron-winstaller';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

type MakerSquirrelConfig = Omit<
  ElectronWinstallerOptions,
  'appDirectory' | 'outputDirectory'
>;

export default class MakerSquirrel extends MakerBase<MakerSquirrelConfig> {
  name = 'squirrel';

  defaultPlatforms: ForgePlatform[] = ['win32'];

  isSupportedOnCurrentPlatform(): boolean {
    return (
      this.isInstalled('electron-winstaller') &&
      !process.env.DISABLE_SQUIRREL_TEST
    );
  }

  async make({
    dir,
    makeDir,
    targetArch,
    packageJSON,
    appName
  }: MakerOptions): Promise<string[]> {
    const outPath = path.resolve(makeDir, `squirrel.windows/${targetArch}`);
    await this.ensureDirectory(outPath);

    const winstallerConfig: ElectronWinstallerOptions = {
      name: packageJSON.name,
      title: appName,
      noMsi: true,
      exe: `${appName}.exe`,
      setupExe: `${appName}-${packageJSON.version} Setup.exe`,
      ...this.config,
      appDirectory: dir,
      outputDirectory: outPath
    };

    await createWindowsInstaller(winstallerConfig);

    const nupkgVersion = convertVersion(packageJSON.version);

    const artifacts = [
      path.resolve(outPath, 'RELEASES'),
      path.resolve(outPath, winstallerConfig.setupExe || `${appName}Setup.exe`),
      path.resolve(
        outPath,
        `${winstallerConfig.name}-${nupkgVersion}-full.nupkg`
      )
    ];
    // Delta Path is for auto updater
    const deltaPath = path.resolve(
      outPath,
      `${winstallerConfig.name}-${nupkgVersion}-delta.nupkg`
    );
    if (winstallerConfig.remoteReleases || fs.existsSync(deltaPath)) {
      artifacts.push(deltaPath);
    }
    const msiPath = path.resolve(
      outPath,
      winstallerConfig.setupMsi || `${appName}Setup.msi`
    );
    if (!winstallerConfig.noMsi && fs.existsSync(msiPath)) {
      artifacts.push(msiPath);
    }

    const zipName = `${appName}-${packageJSON.version} Setup.zip`;
    const zipPath = `${outPath}\\${zipName}`;
    const archive = archiver('zip', { zlib: { level: 0 } });
    archive.pipe(fs.createWriteStream(zipPath));
    artifacts.forEach(artifact => {
      const tmp = artifact.split('\\');
      const name = tmp[tmp.length - 1];
      archive.file(artifact, { name });
    });
    await archive.finalize();

    const files = fs.readdirSync(outPath, { withFileTypes: true });
    files.forEach(file => {
      const { name } = file;
      if (!name.includes(zipName)) fs.unlinkSync(name);
    });

    return [zipPath];
  }
}
