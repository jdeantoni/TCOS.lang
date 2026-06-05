# interpreterCCFG

`interpreterCCFG` est un interpreteur generique pour executer un CCFG deja produit par le compiler front d'un langage.

Il ne parse pas directement un fichier source et ne depend pas d'un langage precis comme simpleL ou ParLang. Le workflow attendu est :

1. le compiler front du langage lit le fichier source ;
2. il produit un objet `CCFG` ;
3. `CCFGInterpreter` execute ce graphe.

L'objectif est d'avoir une base propre pour une execution normale, puis pour un futur DAP : step, resume, breakpoints, threads, variables, stack frames, etc.

## Build

Depuis `packages/interpreterCCFG` :

```sh
npm run build
```


## Methodes principales

- `run(options)` : execution directe, ignore les breakpoints.
- `execute(options)` / `resume(options)` / `continueExecution(options)` : continue l'execution avec prise en compte des breakpoints.
- `step(options)` : execute un pas.
- `pause()` : met l'interpreteur en pause.
- `stop()` : stoppe l'execution.
- `setBreakpoint(nodeUid)` : ajoute un breakpoint sur un node CCFG.
- `setBreakpoints(nodeUids)` : remplace les breakpoints et retourne leur validation.
- `getSnapshot()` : retourne l'etat courant utile pour inspection ou DAP.
- `getThreads()` : retourne les threads runtime.
- `getStackTrace(threadId)` : donne une stack simplifiee compatible avec une integration DAP.
- `getScopes(threadId)` / `getVariables(ref)` : expose locals, globals et temporaires.

## Options utiles

```ts
new CCFGInterpreter(ccfg, {
    stopOnEntry: true,
    maxSteps: 1000,
    timeoutMs: 5000,
    debug: false
});
```

- `stopOnEntry` demarre en pause avant execution.
- `maxSteps` evite les boucles infinies.
- `timeoutMs` limite le temps d'execution.
- `prepareCCFG` vaut `true` par defaut et prepare le graphe avant execution.

## Tester sans DAP

Un script existe pour tester un fichier simpleL :

```sh
npm run build
node scripts/interpret-simpleL.mjs ../../examples/programs/basictestplus.simple
```

Avec trace pas-a-pas :

```sh
TRACE=1 node scripts/interpret-simpleL.mjs ../../examples/programs/testWhile.simple
```

Avec dump du CCFG :

```sh
DUMP=1 node scripts/interpret-simpleL.mjs ../../examples/programs/testPeriodic.simple
```

Pour des programmes periodiques ou paralleles, il faut utiliser `maxSteps` ou `timeoutMs`, car certains graphes sont faits pour ne pas terminer naturellement.



