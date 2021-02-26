"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const maker_base_1 = __importDefault(require("@electron-forge/maker-base"));
const electron_winstaller_1 = require("electron-winstaller");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MakerSquirrel extends maker_base_1.default {
    constructor() {
        super(...arguments);
        this.name = 'squirrel';
        this.defaultPlatforms = ['win32'];
    }
    isSupportedOnCurrentPlatform() {
        return (this.isInstalled('electron-winstaller') &&
            !process.env.DISABLE_SQUIRREL_TEST);
    }
    async make({ dir, makeDir, targetArch, packageJSON, appName }) {
        const outPath = path_1.default.resolve(makeDir, `squirrel.windows/${targetArch}`);
        await this.ensureDirectory(outPath);
        const winstallerConfig = {
            name: packageJSON.name,
            title: appName,
            noMsi: true,
            exe: `${appName}.exe`,
            setupExe: `${appName}-${packageJSON.version} Setup.exe`,
            ...this.config,
            appDirectory: dir,
            outputDirectory: outPath
        };
        await electron_winstaller_1.createWindowsInstaller(winstallerConfig);
        const nupkgVersion = electron_winstaller_1.convertVersion(packageJSON.version);
        const artifacts = [
            path_1.default.resolve(outPath, 'RELEASES'),
            path_1.default.resolve(outPath, winstallerConfig.setupExe || `${appName}Setup.exe`),
            path_1.default.resolve(outPath, `${winstallerConfig.name}-${nupkgVersion}-full.nupkg`)
        ];
        const deltaPath = path_1.default.resolve(outPath, `${winstallerConfig.name}-${nupkgVersion}-delta.nupkg`);
        if (winstallerConfig.remoteReleases || fs_1.default.existsSync(deltaPath)) {
            artifacts.push(deltaPath);
        }
        const msiPath = path_1.default.resolve(outPath, winstallerConfig.setupMsi || `${appName}Setup.msi`);
        if (!winstallerConfig.noMsi && fs_1.default.existsSync(msiPath)) {
            artifacts.push(msiPath);
        }
        return artifacts;
    }
}
exports.default = MakerSquirrel;
//# sourceMappingURL=index.js.map