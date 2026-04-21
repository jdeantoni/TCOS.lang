import { succes } from './display';
import { installAllPackages, installAllLanguages } from './installation';
import { generatePrograms } from './generation';

async function main(): Promise<void> {
   
    await installAllPackages();
    await installAllLanguages();

    succes("Installation complete!");

    await generatePrograms();

    succes("End");
}

// Lancer le script
main();