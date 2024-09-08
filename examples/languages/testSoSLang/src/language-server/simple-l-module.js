"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSimpleLServices = exports.SimpleLModule = void 0;
var langium_1 = require("langium");
var module_1 = require("./generated/module");
var simple_l_validator_1 = require("./simple-l-validator");
/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
exports.SimpleLModule = {
    validation: {
        SimpleLValidator: function () { return new simple_l_validator_1.SimpleLValidator(); }
    }
};
/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
function createSimpleLServices(context) {
    var shared = (0, langium_1.inject)((0, langium_1.createDefaultSharedModule)(context), module_1.SimpleLGeneratedSharedModule);
    var SimpleL = (0, langium_1.inject)((0, langium_1.createDefaultModule)({ shared: shared }), module_1.SimpleLGeneratedModule, exports.SimpleLModule);
    shared.ServiceRegistry.register(SimpleL);
    (0, simple_l_validator_1.registerValidationChecks)(SimpleL);
    return { shared: shared, SimpleL: SimpleL };
}
exports.createSimpleLServices = createSimpleLServices;
