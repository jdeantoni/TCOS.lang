import { error, success } from './display';
import { installAllPackages, installAllLanguages } from './installation';
import { generatePrograms } from './generation';

async function main(): Promise<void>{
   
    try {
        await installAllPackages();
        await installAllLanguages();

        success("Installation complete!");

        await generatePrograms();

        success("End");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// Lancer le script
main();