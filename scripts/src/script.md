# TCOS Scripts

Automation scripts for installing TCOS, its languages, and running program generation.

## Usage

### Interactive mode

```bash
npm run dev
```

Installs all packages `(CCFG, backend-compiler, interpreter, TCOS)` and languages `(ParLang, simpleL, etc.)`, then enters an interactive loop where you can:
- choose a language
- pick a program file
- select an output format (C++, Python, or JavaScript)
- enable debug mode

For each generated program, the script asks whether you want to open VS Code on the relevant folder and whether you want to make changes before continuing.

A final summary lists the status of every installation and generation step.

### Batch mode

```bash
npm run batch
```

Same installation as `npm run dev`, but skips all interactive prompts. After installation, the script automatically generates every program found in `examples/programs/` in all three formats (C++, Python, JavaScript) with debug enabled.

The output is a clean summary of installations and generations. Failed commands are listed at the end for manual reproduction.

This mode is suitable for use in a CI/CD pipeline to verify that the generation chain runs without crashing. A finer-grained `non-regression test` on the `CCFG` is planned but not yet implemented.

#### Status

Non-regression tests on generated CCFGs are not yet implemented. The graph isomorphism approach was not viable on symmetric CCFGs (timeouts beyond 10 seconds on 8 of 10 test programs). A simpler comparison strategy will be added once the approach is finalized with the project lead.

### Verbose mode

Both commands accept the `--all` flag to display the full output of internal commands
(npm install, langium:generate, TCOS CLI logs):

```bash
npm run dev:all
npm run batch:all
```

Useful for debugging when a step fails.

### Watch mode

```bash
npm run watch
```

Watch mode performs the same initial installation as the other modes. Then, instead of enerating programs, it keeps running and watches the project sources for file changes.

When a file is modified, the watcher identifies which node it belongs to and rebuilds that node along with all its dependents, in topological order. For example, modifying a file in `packages/CCFG` triggers the rebuild of `ccfg`, then `backend-compiler`, then `interpreter`, then the language compilers (`ParLang`, `simpleL`) that depend on them.

For language compilers, the rebuild involves three steps: `langium:generate` regenerates the parser from the `.langium` grammar, the TCOS meta-compiler regenerates the semantic frontend from the `.tcos` specification, and `npm run build` produces the final binary.

If a rebuild fails, the cascade is interrupted but the watcher itself stays alive and is ready for the next modification. To stop the watcher, press `Ctrl+C`.