# TCOS Script usage guide

Automation scripts for installing TCOS, its languages, and running program generation.

## Project structure

For a breakdown of the codebase, see the [maintenance guide](./script-maintenance.md).

## Usage

### Choosing a mode

- Use `batch` mode for end-to-end verification (CI, before a commit).
- Use `watch` mode for active development: edit, save, and the relevant artifacts are rebuilt automatically.

### Batch mode

```bash
npm run batch
```

Installs all packages (CCFG, backend-compiler, interpreter, TCOS) and languages (ParLang, simpleL, etc.). After installation, the script automatically generates every program found in `examples/programs/` in all three formats (C++, Python, JavaScript) with debug enabled.  
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

For language compilers, the rebuild involves three steps: `langium:generate` regenerates the parser from the `.langium` grammar, the TCOS meta-compiler regenerates the semantic frontend from the `.tcos` or `.sos` specification, and `npm run build` produces the final binary. This rebuild is triggered whether you modify a file inside the language's own folder *or* its TCOS specification file at the root of `examples/languages/`.

Once the language compilers are rebuilt, the watcher regenerates every program of those languages (in C++, Python, and JavaScript) so the generated outputs stay in sync.

Direct modifications to test programs in `examples/programs/` are also watched: when a `.parlang` or `.simple` file is saved, only that program is regenerated (no cascade), in all three target formats.

If a new file change arrives while a build is in progress, the in-flight build is aborted and the watcher starts a fresh cascade for the new change. This avoids stacking redundant builds when several files are saved in quick succession.

If a rebuild fails, the cascade is interrupted but the watcher itself stays alive and is ready for the next modification. To stop the watcher, press `Ctrl+C`.

### Verbose flag

Only `npm run batch` accepts the `--all` flag to display the full output of internal commands (npm install, langium:generate, TCOS CLI logs):

```bash
npm run batch:all
```

Useful for debugging when a step fails.

`npm run watch` already uses the `--all` flag because this mode always needs full output.

---

- [README](../README.md)
- [Maintenance](./script-maintenance.md)