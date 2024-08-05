"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonGenerator = void 0;
class PythonGenerator {
    isDebug;
    constructor(debug) {
        this.isDebug = debug;
    }
    goToFlag(codeFile, queueUID) {
        throw new Error("Method not implemented.");
    }
    createFlagToGoBackTo(codeFile, uid) {
        throw new Error("Method not implemented.");
    }
    createEqualsVerif(firstValue, secondValue) {
        if (firstValue == "true")
            firstValue = "True";
        if (firstValue == "false")
            firstValue = "False";
        if (secondValue == "true")
            secondValue = "True";
        if (secondValue == "false")
            secondValue = "False";
        return firstValue + " == " + secondValue;
    }
    nbTabs = 1;
    nameFile(filename) {
        return `${filename}.py`;
    }
    createBase(codeFile, debug) {
        // imports ----------------------------------------------------------------------------------------------------
        codeFile.append(`import threading \n`);
        codeFile.append(`import time \n`);
        codeFile.append(`from queue import Queue, LifoQueue\n`);
        if (debug) {
            codeFile.append(`#define DEBUG 1 \n`);
        } // debug
        // global variables ---------------------------------------------------------------------------------------
        codeFile.append(`##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma \n`);
        codeFile.append(`returnQueue = LifoQueue()\n`);
    }
    endFile(codeFile) {
        codeFile.append(`if __name__ == "__main__": \n`);
        codeFile.append(`\tmain() \n`);
    }
    createFunction(codeFile, fname, params, returnType, insideFunction) {
        codeFile.append(`def function${fname}(${params.map(p => p.name).join(", ")}): \n`);
        this.nbTabs++;
        for (let i = 0; i < insideFunction.length; i++) {
            codeFile.append(Array(this.nbTabs).join("\t") + insideFunction[i]);
        }
        this.nbTabs--;
    }
    createMainFunction(codeFile) {
        codeFile.append(`def main(): \n`);
        this.nbTabs++;
    }
    createFuncCall(codeFile, fname, params, typeName) {
        if (typeName == "void") {
            return [`function${fname}(${params.join(", ")}); \n`];
        }
        else
            return [`result${fname} = function${fname}(${params.join(", ")}); \n`];
    }
    createIf(codeFile, guards, insideOfIf) {
        let createIfString = [];
        createIfString.push(`if ${guards.join(" and ")}: \n`);
        insideOfIf.forEach(element => {
            codeFile.append("\t" + element);
        });
        return createIfString;
    }
    createSynchronizer(codeFile, synchUID) {
        codeFile.append(Array(this.nbTabs).join("\t") + `sync${synchUID} = threading.Event() \n`);
        return [`sync${synchUID} = threading.Event() \n`];
    }
    waitForSynchronizer(codeFile, synchUID) {
        codeFile.append(Array(this.nbTabs).join("\t") + `sync${synchUID}.wait() \n`);
        codeFile.append(Array(this.nbTabs).join("\t") + `sync${synchUID}.clear() \n`);
        return [`sync${synchUID}.wait() `, ` sync${synchUID}.clear() \n`];
    }
    activateSynchronizer(codeFile, synchUID) {
        codeFile.append(Array(this.nbTabs).join("\t") + `sync${synchUID}.set() \n`);
        return [`sync${synchUID}.set() \n`];
    }
    createAndOpenThread(codeFile, uid) {
        codeFile.append(Array(this.nbTabs).join("\t") + `thread${uid} = threading.Thread(target=thread${uid}) \n`);
        codeFile.append(Array(this.nbTabs).join("\t") + `thread${uid}.start() \n`);
        codeFile.append(Array(this.nbTabs).join("\t") + `thread${uid}.join() \n`);
        return [`thread${uid} = threading.Thread(target=thread${uid}) \n`, `thread${uid}.start() \n`, `thread${uid}.join() \n`];
    }
    endThread(codeFile, uid) {
        codeFile.append(Array(this.nbTabs).join("\t") + `return \n`);
        return [`return \n`];
    }
    endSection(codeFile) {
        this.nbTabs--;
    }
    createQueue(codeFile, queueUID) {
        codeFile.append(Array(this.nbTabs).join("\t") + `queue${queueUID} = Queue() \n`);
        return [`queue${queueUID} = Queue() \n`];
    }
    createLockingQueue(codeFile, typeName, queueUID) {
        codeFile.append(Array(this.nbTabs).join("\t") + `queue${queueUID} = Queue() \n`);
        return [`queue${queueUID} = Queue() \n`];
    }
    receiveFromQueue(codeFile, queueUID, typeName, varName) {
        codeFile.append(Array(this.nbTabs).join("\t") + `${varName} = queue${queueUID}.get() \n`);
        return [`${varName} = queue${queueUID}.get() \n`];
    }
    sendToQueue(codeFile, queueUID, typeName, varName) {
        codeFile.append(Array(this.nbTabs).join("\t") + `queue${queueUID}.put(${varName}) \n`);
        return [`queue${queueUID}.put(${varName}) \n`];
    }
    assignVar(codeFile, varName, value) {
        codeFile.append(Array(this.nbTabs).join("\t") + `${varName} = ${value} \n`);
        return [`${varName} = ${value} \n`];
    }
    returnVar(codeFile, varName) {
        codeFile.append(Array(this.nbTabs).join("\t") + `return ${varName} \n`);
        return [`return ${varName} \n`];
    }
    createVar(codeFile, type, varName) {
        return [""];
    }
    createGlobalVar(codeFile, type, varName) {
        codeFile.append(Array(this.nbTabs).join("\t") + `1+1 \n`);
        return [``];
    }
    setVarFromGlobal(codeFile, type, varName, value) {
        codeFile.append(Array(this.nbTabs).join("\t") + `global ${value} \n`);
        codeFile.append(Array(this.nbTabs).join("\t") + `${varName} = ${value} \n`);
        return [`global ${value} \n`, `${varName} = ${value} \n`];
    }
    setGlobalVar(codeFile, type, varName, value) {
        codeFile.append(Array(this.nbTabs).join("\t") + `global ${varName} \n`);
        codeFile.append(Array(this.nbTabs).join("\t") + `${varName} = ${value} \n`);
        return [`global ${varName} \n`, `${varName} = ${value} \n`];
    }
    operation(codeFile, varName, n1, op, n2) {
        codeFile.append(Array(this.nbTabs).join("\t") + `${varName} = ${n1} ${op} ${n2} \n`);
        return [`${varName} = ${n1} ${op} ${n2} \n`];
    }
}
exports.PythonGenerator = PythonGenerator;
