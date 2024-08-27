export class PythonGenerator {
    debug;
    constructor(debug = false) {
        this.debug = debug;
    }
    setDebug(debug) {
        this.debug = debug;
    }
    // goToFlag(codeFile: CompositeGeneratorNode, queueUID: number): string[] {
    //     throw new Error("Method not implemented.");
    // }
    setLoopFlag(queueUID) {
        return [`flag${queueUID} = True\n`];
    }
    createLoop(uid, insideLoop) {
        let res = [`while flag${uid} == True: \n`, `\tflag${uid} = False \n`];
        for (let i = 0; i < insideLoop.length; i++) {
            res.push("\t" + insideLoop[i]);
        }
        return res;
    }
    createEqualsVerif(firstValue, secondValue) {
        firstValue = firstValue.charAt(0).toUpperCase() + firstValue.slice(1);
        secondValue = secondValue.charAt(0).toUpperCase() + secondValue.slice(1);
        return firstValue + " == " + secondValue;
    }
    nbTabs = 1;
    nameFile(filename) {
        return `${filename}.py`;
    }
    createBase() {
        let res = [];
        // imports ----------------------------------------------------------------------------------------------------
        res.push(`import threading \n`);
        res.push(`import time \n`);
        res.push(`from queue import Queue, LifoQueue\n`);
        // global variables ---------------------------------------------------------------------------------------
        res.push(`##std::unordered_map<std::string, void*> sigma; ##std::mutex sigma_mutex;  // protects sigma \n`);
        res.push(`returnQueue = LifoQueue()\n`);
        res.push(`sigma: dict = {}\nsigma_mutex = threading.Lock()\n`);
        return res;
    }
    endFile() {
        let res = [];
        res.push(`if __name__ == "__main__": \n`);
        res.push(`\tmain() \n`);
        return res;
    }
    createFunction(fname, params, returnType, insideFunction) {
        let res = [];
        res.push(`def function${fname}(${params.map(p => p.name).join(", ")}): \n`);
        if (this.debug) {
            res.push(`\tprint("\tfunction${fname} started") \n`);
        }
        for (let i = 0; i < insideFunction.length; i++) {
            res.push("\t" + insideFunction[i]);
        }
        return res;
    }
    createMainFunction(insideMain) {
        let res = [];
        res.push(`def main(): \n`);
        for (let i = 0; i < insideMain.length; i++) {
            res.push("\t" + insideMain[i]);
        }
        if (this.debug) {
            res.push(`\tfor v in sigma:\n\t\tprint(str(v)+" = " + str(sigma[v])) \n`);
        }
        return res;
    }
    createFuncCall(fname, params, typeName) {
        if (typeName == "void") {
            return [`function${fname}(${params.join(", ")}); \n`];
        }
        else
            return [`result${fname} = function${fname}(${params.join(", ")}); \n`];
    }
    createIf(guards, insideOfIf) {
        let createIfString = [];
        createIfString.push(`if ${guards.join(" and ")}: \n`);
        if (this.debug) {
            createIfString.push(`\tprint("(${guards.join(" and ")}) is TRUE") \n`);
        }
        insideOfIf.forEach(element => {
            createIfString.push("\t" + element);
        });
        return createIfString;
    }
    createSynchronizer(synchUID) {
        return [`sync${synchUID} = Queue() \n`];
    }
    waitForSynchronizer(synchUID) {
        return [`sync${synchUID}.get() \n`];
    }
    activateSynchronizer(synchUID) {
        return [`sync${synchUID}.put(42) \n`];
    }
    createAndOpenThread(uid, insideThreadCode) {
        let res = [`def codeThread${uid}():\n`];
        if (this.debug) {
            res.push(`\tprint("thread${uid} started") \n`);
        }
        for (let i = 0; i < insideThreadCode.length; i++) {
            res.push("\t" + insideThreadCode[i]);
        }
        res = [...res, ...[`thread${uid} = threading.Thread(target=codeThread${uid}) \n`, `thread${uid}.start() \n`, `thread${uid}.join() \n`]];
        return res;
    }
    endThread(uid) {
        return [`return \n`];
    }
    endSection() {
        this.nbTabs--;
    }
    createQueue(queueUID) {
        return [`queue${queueUID} = Queue() \n`];
    }
    createLockingQueue(typeName, queueUID) {
        return [`queue${queueUID} = Queue() \n`];
    }
    receiveFromQueue(queueUID, typeName, varName) {
        return [`${varName} = queue${queueUID}.get() \n`];
    }
    sendToQueue(queueUID, typeName, varName) {
        return [`queue${queueUID}.put(${varName}) \n`];
    }
    assignVar(varName, value) {
        if (value == "true" || value == "false") {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        return [`${varName} = ${value} \n`];
    }
    returnVar(varName) {
        return [`return ${varName} \n`];
    }
    createVar(type, varName) {
        return [`\n`];
    }
    createGlobalVar(type, varName) {
        return [`sigma_mutex.acquire()\n`, `sigma["${varName}"] = ${type}()\n`, `sigma_mutex.release()\n`];
    }
    setVarFromGlobal(type, varName, value) {
        return [`sigma_mutex.acquire()\n`, `${varName} = sigma["${value}"]\n`, `sigma_mutex.release()\n`];
    }
    setGlobalVar(type, varName, value) {
        if (value == "true" || value == "false") {
            value = value.charAt(0).toUpperCase() + value.slice(1);
        }
        return [`sigma_mutex.acquire()\n`, `sigma["${varName}"] = ${value}\n`, `sigma_mutex.release()\n`];
    }
    operation(varName, n1, op, n2) {
        return [`${varName} = ${n1} ${op} ${n2} \n`];
    }
    createSleep(duration) {
        return [`time.sleep(${duration}//1000) \n`];
    }
}
