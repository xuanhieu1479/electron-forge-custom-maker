import MakerBase, { MakerOptions } from "@electron-forge/maker-base";
import { ForgePlatform } from "@electron-forge/shared-types";
import { Options as ElectronWinstallerOptions } from "electron-winstaller";
declare type MakerSquirrelConfig = Omit<ElectronWinstallerOptions, "appDirectory" | "outputDirectory">;
export default class MakerSquirrel extends MakerBase<MakerSquirrelConfig> {
    name: string;
    defaultPlatforms: ForgePlatform[];
    isSupportedOnCurrentPlatform(): boolean;
    make({ dir, makeDir, targetArch, packageJSON, appName, }: MakerOptions): Promise<string[]>;
}
export {};
