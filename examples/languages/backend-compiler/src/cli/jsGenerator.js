"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsGenerator = void 0;
class JsGenerator {
    isDebug = false;
    setDebug(debug) {
        this.isDebug = debug;
    }
    nameFile(filename) {
        return `${filename}.js`;
    }
    createBase() {
        let res = [];
        res.push(`
class Void{}
let sigma = new Map();

`); // global variables
        return res;
    }
    endFile() {
        return [`main();\n`];
    }
    createFunction(fname, params, returnType, insideFunction) {
        let res = [];
        res.push("async function function" + fname + `(${params.map(p => p.name).join(", ")}){\n`);
        if (this.isDebug) {
            res.push(`\tconsole.log("\tfunction${fname} started");\n`);
        }
        for (let i = 0; i < insideFunction.length; i++) {
            res.push("\t" + insideFunction[i]);
        }
        res.push("}\n");
        return res;
    }
    createMainFunction(insideMain) {
        let res = [];
        res.push("async function main(){\n\t");
        for (let i = 0; i < insideMain.length; i++) {
            res.push("\t" + insideMain[i]);
        }
        if (this.isDebug) {
            res.push(`\tfor (let v of sigma){\n`);
            res.push(`\t\tconsole.log(v[0]+" = " + v[1]);\n`);
            res.push(`\t}\n`);
        }
        res.push("}\n");
        return res;
    }
    createFuncCall(fname, params, typeName) {
        if (typeName == "void") {
            return [`await function${fname}(${params.join(", ")});\n`];
        }
        return ["let result" + fname + " = await function" + fname + `(${params.join(", ")});\n`];
    }
    createIf(guards, insideOfIf) {
        let createIfString = [];
        createIfString.push("if (" + guards.join(" && ") + "){\n");
        if (this.isDebug) {
            createIfString.push(`\tconsole.log("(${guards.join(" && ")}) is TRUE");\n`);
        }
        insideOfIf.forEach(element => {
            createIfString.push("\t" + element);
        });
        createIfString.push("}\n");
        return createIfString;
    }
    createAndOpenThread(uid, insideThreadCode) {
        let threadCode = [];
        threadCode = [...threadCode, `async function thread${uid}(){
            `];
        if (this.isDebug) {
            threadCode.push(`\tconsole.log("thread${uid} started");\n`);
        }
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, "\t" + insideThreadCode[i]];
        }
        threadCode = [...threadCode, `}\n`];
        threadCode = [...threadCode, `thread${uid}();\n`];
        return threadCode;
    }
    createQueue(queueUID) {
        return [`var queue${queueUID} = [];\n`];
    }
    createLockingQueue(typeName, queueUID) {
        return [`var queue${queueUID} = [];\n`];
    }
    receiveFromQueue(queueUID, typeName, varName) {
        return [`{\n`, `${varName} = queue${queueUID}.pop();\n`, `\twhile (${varName} == undefined){\n`, `\t\tawait new Promise(resolve => setTimeout(resolve, 100));\n`, `\t\t${varName} = queue${queueUID}.pop();\n`, `\t}\n`, `}\n`];
    }
    sendToQueue(queueUID, typeName, varName) {
        return [`queue${queueUID}.push(${varName});\n`];
    }
    createSynchronizer(synchUID) {
        return [`var sync${synchUID} = [];\n`];
    }
    activateSynchronizer(synchUID) {
        return [`sync${synchUID}.push(42);\n`];
    }
    waitForSynchronizer(synchUID) {
        return [`{\n`, `\tfakeVar${synchUID} = sync${synchUID}.pop();\n`, `\twhile (fakeVar${synchUID} == undefined){\n`, `\t\tawait new Promise(resolve => setTimeout(resolve, 100));\n`, `\t\tfakeVar${synchUID} = sync${synchUID}.pop();\n`, `\t}\n`, `}\n`];
    }
    createLoop(uid, insideLoop) {
        let res = [];
        res.push(`var flag${uid} = true;\n`);
        res.push(`while(flag${uid}){\n`);
        res.push(`\tflag${uid} = false;\n`);
        for (let i = 0; i < insideLoop.length; i++) {
            res.push("\t" + insideLoop[i]);
        }
        res.push(`}\n`);
        return res;
    }
    setLoopFlag(uid) {
        return [`flag${uid} = true;\n`];
    }
    createEqualsVerif(firstValue, secondValue) {
        return firstValue + " == " + secondValue;
    }
    assignVar(varName, value) {
        return [varName + " = " + value + ";\n"];
    }
    returnVar(varName) {
        return ["return " + varName + ";\n"];
    }
    createVar(type, varName) {
        return ["let " + varName + ";\n"];
    }
    createGlobalVar(type, varName) {
        return [`sigma.set("${varName}", undefined);\n`];
    }
    setVarFromGlobal(type, varName, value) {
        return [`${varName} = sigma.get("${value}");\n`];
    }
    setGlobalVar(type, varName, value) {
        return [`sigma.set("${varName}", ${value});\n`];
    }
    operation(varName, n1, op, n2) {
        return [varName + " = " + n1 + " " + op + " " + n2 + ";\n"];
    }
    createSleep(duration) {
        return ["await new Promise(resolve => setTimeout(resolve, " + duration + "));\n"];
    }
}
exports.JsGenerator = JsGenerator;
