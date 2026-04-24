import * as path from 'path';

// === Paths ===
export const ROOT = path.resolve(__dirname, '../..')
export const LOGS_DIR = path.join("..", "examples", "programs", "logs");

// === Interfaces ===
export interface LanguageConfig {
    extension: string;
    dependances: string[];
    tcosFile: string;
}

export interface installationOptionsInterface{
    link?: string[];
    build?: boolean;
    linkSelf?: boolean;
    customSteps?: (() => Promise<void>)[];
}

// === Globals variables === 
export const LANGUAGES: Record<string, LanguageConfig> = {
    "ParLang": {
        extension: ".parlang",
        dependances: ["ccfg", "backend-compiler"],
        tcosFile: "parlang.tcos"
    },
    "simpleL": {
        extension: ".simple",
        dependances: ["ccfg", "backend-compiler"],
        tcosFile: "simpleL.tcos"
    }
};

export const PACKAGES: { [key: string]: string[] } = {
    "CCFG": [],
    "backend-compiler": ["ccfg"],
    "TCOS": ["ccfg", "backend-compiler"],
};

export const PROGRAMING_LANGUAGES = ["C++", "Python", "JavaScript"];

export const RESET = '\x1b[0m';
export const RED = '\x1b[31m';
export const GREEN = '\x1b[32m';
export const YELLOW = '\x1b[33m'
export const CYAN = '\x1b[36m';