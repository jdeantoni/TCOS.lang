// ============================================================
// Interfaces
// ============================================================

export interface LanguageConfig {
    extension: string;
    npmLinks: string[];
    tcosFile: string;
}

export interface installationOptions{
    link?: string[];
    build?: boolean;
    linkSelf?: boolean;
    customSteps?: (() => Promise<void>)[];
}

export interface BatchResult {
    language: string;
    fileName: string;
    format: string;
    status: "success" | "error";
    failedCommand?: string;
    dotName?: string
}

export interface InstallResult {
    name: string;
    type: "package" | "language";
    status: "success" | "error";
}

export interface NodeInfo {
    folder: string;
    dependsOn: string[];
}