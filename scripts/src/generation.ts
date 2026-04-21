import * as path from 'path';
import { info, success, error, askYesNo, askText, askChoice } from './display';
import { executeCommand } from './commands';

const ROOT = path.resolve(__dirname, '../..')

export async function generatePrograms(): Promise<void> {
    const programsFolder = path.join(ROOT, "examples", "programs");
    
    let DYWContinue = true;
    
    while (DYWContinue) {
        info("Program Generation :");
        
        const folder = await askText("What test do you want generate (Parlang, SimpleL): ");
        const fileName = await askText("File name (ex: test1.parlang): ");
        const format = await askChoice("Output format:", ["C++", "Python", "JavaScript"]);
        const debug = await askYesNo("Enable debug mode?");
        
        let command = `node ../languages/${folder}/bin/cli.js generate ${fileName}`;
        
        if (format === "Python") {
            command += " --python";
        } else if (format === "JavaScript") {
            command += " --js";
        }
        
        if (debug) {
            command += " --debug";
        }

        try {
            await executeCommand(command, programsFolder);
            success("Program generated in examples/programs/generated/");
        } catch (err) {
            error("Generation failed!");
        }
        
        DYWContinue = await askYesNo("Do you want to generate another program?");
    }
}