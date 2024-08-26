"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CppGenerator = void 0;
class CppGenerator {
    debug;
    constructor(debug = false) {
        this.debug = debug;
    }
    setDebug(debug) {
        this.debug = debug;
    }
    nameFile(filename) {
        return `${filename}.cpp`;
    }
    createBase() {
        let res = [];
        res.push(`
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        `); // imports
        res.push(`
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        `); // global variables
        return res;
    }
    endFile() {
        return [];
    }
    createFunction(fname, params, returnType, insideFunction) {
        let res = [];
        res.push(returnType + " function" + fname + `(${params.map(p => p.toString()).join(", ")}){\n`);
        if (this.debug) {
            res.push(`std::cout << "\tfunction${fname} started" << std::endl;\n`);
        }
        for (let i = 0; i < insideFunction.length; i++) {
            res.push("\t" + insideFunction[i]);
        }
        res.push("}\n");
        return res;
    }
    createMainFunction(insideMain) {
        let res = [];
        res.push("int main(){\n\t");
        for (let i = 0; i < insideMain.length; i++) {
            res.push("\t" + insideMain[i]);
        }
        res.push("for(auto entry : sigma){ std::cout << entry.first << \" : \" << *((int*)entry.second) << std::endl;}\n");
        res.push("}\n");
        return res;
    }
    createFuncCall(fname, params, typeName) {
        if (typeName == "void") {
            return [`function${fname}(${params.join(", ")});\n`];
        }
        return [typeName + " result" + fname + " = function" + fname + `(${params.join(", ")});\n`];
    }
    createIf(guards, insideOfIf) {
        let createIfString = [];
        createIfString.push("if (" + guards.join(" && ") + "){\n");
        if (this.debug) {
            createIfString.push(`std::cout << "(${guards.join(" && ")}) is TRUE" << std::endl;\n`);
        }
        insideOfIf.forEach(element => {
            createIfString.push("\t" + element);
        });
        createIfString.push("}\n");
        return createIfString;
    }
    createAndOpenThread(uid, insideThreadCode) {
        let threadCode = [];
        threadCode = [...threadCode, `std::thread thread${uid}([&](){\n`];
        if (this.debug) {
            threadCode.push(`std::cout << "thread${uid} started" << std::endl;\n`);
        }
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, "\t" + insideThreadCode[i]];
        }
        threadCode = [...threadCode, `});\n`, `thread${uid}.detach();\n`];
        return threadCode;
    }
    createQueue(queueUID) {
        return [`LockingQueue<Void> queue${queueUID};\n`];
    }
    createLockingQueue(typeName, queueUID) {
        return [`LockingQueue<${typeName}> queue${queueUID};\n`];
    }
    receiveFromQueue(queueUID, typeName, varName) {
        return ["queue" + queueUID + ".waitAndPop(" + varName + ");\n"];
    }
    sendToQueue(queueUID, typeName, varName) {
        return ["queue" + queueUID + ".push(" + varName + ");\n"];
    }
    createSynchronizer(synchUID) {
        return [`bool flag${synchUID} = true;\n`, `LockingQueue<Void> synch${synchUID};\n`];
    }
    activateSynchronizer(synchUID) {
        return ["{Void fakeParam" + synchUID + ";\n ", "synch" + synchUID + ".push(fakeParam" + synchUID + ");}\n"];
    }
    waitForSynchronizer(synchUID) {
        return ["{Void joinPopped" + synchUID + ";\n ", "synch" + synchUID + ".waitAndPop(joinPopped" + synchUID + ");}\n"];
    }
    createLoop(uid, insideLoop) {
        let res = ["flag" + uid + "= true;\nwhile (flag" + uid + " == true){\n\tflag" + uid + " = false;\n"];
        for (let i = 0; i < insideLoop.length; i++) {
            res.push("\t" + insideLoop[i]);
        }
        res.push("}\n");
        return res;
    }
    setLoopFlag(uid) {
        return ["flag" + uid + " = true;\n"];
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
        return [type + " " + varName + ";\n"];
    }
    createGlobalVar(type, varName) {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`, "sigma[\"" + varName + "\"] = new " + type + "();}\n"];
    }
    setVarFromGlobal(type, varName, value) {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`, varName + " = *(" + type + "*)sigma[\"" + value + "\"];}\n"];
    }
    setGlobalVar(type, varName, value) {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`, "*((" + type + "*)sigma[\"" + varName + "\"]) = " + value + ";}\n"];
    }
    operation(varName, n1, op, n2) {
        return [varName + " = " + n1 + " " + op + " " + n2 + ";\n"];
    }
    createSleep(duration) {
        return [`std::this_thread::sleep_for(${duration}ms);\n`];
    }
}
exports.CppGenerator = CppGenerator;
