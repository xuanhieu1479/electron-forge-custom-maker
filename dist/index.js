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
        this.name = 'FolderTagger';
        this.defaultPlatforms = ['win32'];
    }
    isSupportedOnCurrentPlatform() {
        return this.isInstalled('electron-winstaller');
    }
    async make({ dir, makeDir, targetArch, packageJSON }) {
        const outPath = path_1.default.resolve(makeDir, `windows/${targetArch}`);
        await this.ensureDirectory(outPath);
        const winstallerConfig = {
            name: this.name,
            title: this.name,
            noMsi: true,
            exe: `${this.name}.exe`,
            setupExe: `${this.name}-${packageJSON.version} Setup.exe`,
            ...this.config,
            appDirectory: dir,
            outputDirectory: outPath
        };
        await electron_winstaller_1.createWindowsInstaller(winstallerConfig);
        const nupkgVersion = electron_winstaller_1.convertVersion(packageJSON.version);
        const artifacts = [
            path_1.default.resolve(outPath, 'RELEASES'),
            path_1.default.resolve(outPath, winstallerConfig.setupExe || `${this.name} Setup.exe`),
            path_1.default.resolve(outPath, `${winstallerConfig.name}-${nupkgVersion}-full.nupkg`)
        ];
        // For auto updater
        const deltaPath = path_1.default.resolve(outPath, `${winstallerConfig.name}-${nupkgVersion}-delta.nupkg`);
        if (winstallerConfig.remoteReleases || fs_1.default.existsSync(deltaPath)) {
            artifacts.push(deltaPath);
        }
        return artifacts;
    }
}
exports.default = MakerSquirrel;
//# sourceMappingURL=index.js.map