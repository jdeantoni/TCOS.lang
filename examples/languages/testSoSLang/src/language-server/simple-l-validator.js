"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleLValidator = exports.registerValidationChecks = void 0;
/**
 * Register custom validation checks.
 */
function registerValidationChecks(services) {
    var registry = services.validation.ValidationRegistry;
    var validator = services.validation.SimpleLValidator;
    var checks = {
    // Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}
exports.registerValidationChecks = registerValidationChecks;
/**
 * Implementation of custom validations.
 */
var SimpleLValidator = /** @class */ (function () {
    function SimpleLValidator() {
    }
    return SimpleLValidator;
}());
exports.SimpleLValidator = SimpleLValidator;
