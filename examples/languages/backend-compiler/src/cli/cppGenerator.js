"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CppGenerator = void 0;
class CppGenerator {
    isDebug;
    constructor(debug) {
        this.isDebug = debug;
    }
    nameFile(filename) {
        return `${filename}.cpp`;
    }
    createBase(codeFile, debug) {
        codeFile.append(`
        #include <string>
        #include <unordered_map>
        #include <thread>
        #include <mutex>
        #include <iostream>
        #include <chrono>
        #include "../utils/LockingQueue.hpp"
        
        using namespace std::chrono_literals;
        `); // imports
        if (debug) {
            codeFile.append(`
        #define DEBUG 1
            `);
        } // debug
        codeFile.append(`
        class Void{
        };
        
        std::unordered_map<std::string, void*> sigma;
        std::mutex sigma_mutex;  // protects sigma
        
        `); // global variables
    }
    endFile(codeFile) {
    }
    createFunction(codeFile, fname, params, returnType, insideFunction) {
        codeFile.append(returnType + " function" + fname + `(${params.map(p => p.toString()).join(", ")}){\n`);
        for (let i = 0; i < insideFunction.length; i++) {
            codeFile.append(insideFunction[i]);
        }
        codeFile.append("}\n");
    }
    createMainFunction(codeFile, insideMain) {
        codeFile.append("int main(){\n\t");
        for (let i = 0; i < insideMain.length; i++) {
            codeFile.append("\t" + insideMain[i]);
        }
        codeFile.append("for(auto entry : sigma){ std::cout << entry.first << \" : \" << *((int*)entry.second) << std::endl;}");
        codeFile.append("}\n");
    }
    createFuncCall(codeFile, fname, params, typeName) {
        if (typeName == "void") {
            return [`function${fname}(${params.join(", ")});\n`];
        }
        return [typeName + " result" + fname + " = function" + fname + `(${params.join(", ")});\n`];
    }
    createIf(codeFile, guards, insideOfIf) {
        let createIfString = [];
        createIfString.push("if (" + guards.join(" && ") + "){\n");
        insideOfIf.forEach(element => {
            createIfString.push(element);
        });
        createIfString.push("}\n");
        return createIfString;
    }
    createAndOpenThread(codeFile, uid, insideThreadCode) {
        let threadCode = [];
        threadCode = [...threadCode, `std::thread thread${uid}([&](){\n`];
        for (let i = 0; i < insideThreadCode.length; i++) {
            threadCode = [...threadCode, insideThreadCode[i]];
        }
        threadCode = [...threadCode, `});\n`, `thread${uid}.detach();\n`];
        return threadCode;
    }
    createQueue(codeFile, queueUID) {
        return [`LockingQueue<Void> queue${queueUID};\n`];
    }
    createLockingQueue(codeFile, typeName, queueUID) {
        return [`LockingQueue<${typeName}> queue${queueUID};`];
    }
    receiveFromQueue(codeFile, queueUID, typeName, varName) {
        return ["queue" + queueUID + ".waitAndPop(" + varName + ");\n"];
    }
    sendToQueue(codeFile, queueUID, typeName, varName) {
        return ["queue" + queueUID + ".push(" + varName + ");\n"];
    }
    createSynchronizer(codeFile, synchUID) {
        return ["lockingQueue<Void> synch" + synchUID + ";\n"];
    }
    activateSynchronizer(codeFile, synchUID) {
        return ["Void fakeParam" + synchUID + ";\n ", "synch" + synchUID + ".push(fakeParam" + synchUID + ");\n"];
    }
    waitForSynchronizer(codeFile, synchUID) {
        return ["Void joinPopped" + synchUID + ";\n ", "synch" + synchUID + ".waitAndPop(joinPopped" + synchUID + ");\n"];
    }
    createFlagToGoBackTo(codeFile, uid) {
        return ["flag" + uid + " :\n"];
    }
    goToFlag(codeFile, uid) {
        return ["goto flag" + uid + ";\n"];
    }
    createEqualsVerif(firstValue, secondValue) {
        return firstValue + " == " + secondValue;
    }
    assignVar(codeFile, varName, value) {
        return [varName + " = " + value + ";\n"];
    }
    returnVar(codeFile, varName) {
        return ["return " + varName + ";\n"];
    }
    createVar(codeFile, type, varName) {
        return [type + " " + varName + ";\n"];
    }
    createGlobalVar(codeFile, type, varName) {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`, "sigma[\"" + varName + "\"] = new " + type + "();\n}"];
    }
    setVarFromGlobal(codeFile, type, varName, value) {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`, varName + " = *(" + type + "*)sigma[\"" + value + "\"];\n}"];
    }
    setGlobalVar(codeFile, type, varName, value) {
        return [`{const std::lock_guard<std::mutex> lock(sigma_mutex);`, "*((" + type + "*)sigma[\"" + varName + "\"]) = " + value + ";\n}"];
    }
    operation(codeFile, varName, n1, op, n2) {
        return [varName + " = " + n1 + " " + op + " " + n2 + ";\n"];
    }
}
exports.CppGenerator = CppGenerator;
