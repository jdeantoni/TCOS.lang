# TCOS Scripts

Automation scripts for installing TCOS, its languages, and running program generation.

## Project structure

```text
scripts/
├── dist/
├── node_modules/
├── src/
│   ├── commands.ts
│   ├── display.ts
│   ├── generation.ts
│   ├── index.ts
│   ├── installation.ts
│   ├── project.ts
│   ├── state.ts
│   ├── types.ts
│   ├── utils.ts
│   ├── verification.ts
│   └── watcher.ts
├── package-lock.json
├── package.json
├── script.md
└── tsconfig.json
```

## Usage

### Choosing a mode

- Use `interactive` mode for your first contact with the project: it walks you through enerating a program step by step.
- Use `batch` mode for end-to-end verification (CI, before a commit).
- Use `watch` mode for active development: edit, save, and the relevant artifacts are rebuilt automatically.

### Interactive mode

```bash
npm run demo
```

Installs all packages (CCFG, backend-compiler, interpreter, TCOS) and languages (ParLang, simpleL, etc.), then enters an interactive loop where you can:

- choose a language
- pick a program file
- select an output format (C++, Python, or JavaScript)
- enable debug mode

For each packages and languages, the script asks whether you want to open VS Code on the relevant folder.


A final summary lists the status of every installation and generation step.

### Batch mode

```bash
npm run batch
```

Same installation as `npm run dev`, but skips all interactive prompts. After installation, the script automatically generates every program found in `examples/programs/` in all three formats (C++, Python, JavaScript) with debug enabled.

The output is a clean summary of installations and generations. Failed commands are listed at the end for manual reproduction.

This mode can be plugged into a CI/CD pipeline to verify that the generation chain runs end-to-end without crashing. Note that this only validates *propagation* (no command failed), not the *semantic correctness* of the generated CCFGs — that part requires the comparison strategy mentioned below.

#### Status

The non-regression test on the generated CCFGs is not yet implemented. The graph isomorphism approach was not viable on symmetric CCFGs.

### Watch mode

```bash
npm run watch
```

Watch mode performs the same initial installation as the other modes. Then, instead of generating programs once and exiting, it keeps running and watches the project sources for file changes.

When a file is modified, the watcher identifies which node it belongs to and rebuilds that node along with all its dependents, in topological order. For example, modifying a file in `packages/CCFG` triggers the rebuild of `ccfg`, then `backend-compiler`, then `interpreter`, then the language compilers (`ParLang`, `simpleL`) that depend on them.

For language compilers, the rebuild involves three steps: `langium:generate` regenerates the parser from the `.langium` grammar, the TCOS meta-compiler regenerates the semantic frontend from the `.tcos` specification, and `npm run build` produces the final binary.

Once the language compilers are rebuilt, the watcher regenerates every program of those languages (in C++, Python, and JavaScript) so the generated outputs stay in sync.

Direct modifications to test programs in `examples/programs/` are also watched: when a `.parlang` or `.simple` file is saved, only that program is regenerated (no cascade), in all three target formats.

If a new file change arrives while a build is in progress, the in-flight build is aborted and the watcher starts a fresh cascade for the new change. This avoids stacking redundant builds when several files are saved in quick succession.

If a rebuild fails, the cascade is interrupted but the watcher itself stays alive and is ready for the next modification. To stop the watcher, press `Ctrl+C`.

### Verbose flag

 Only two modes accept the `--all` flag to display the full output of internal commands (npm install, langium:generate, TCOS CLI logs):

```bash
npm run demo:all
npm run batch:all
```

Useful for debugging when a step fails.