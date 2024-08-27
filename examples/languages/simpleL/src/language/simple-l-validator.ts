import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { SimpleLAstType, Variable } from './generated/ast.js';
import type { SimpleLServices } from './simple-l-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SimpleLServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SimpleLValidator;
    const checks: ValidationChecks<SimpleLAstType> = {
        Variable: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SimpleLValidator {

    checkPersonStartsWithCapital(variable: Variable, accept: ValidationAcceptor): void {
        if (variable.name) {
            const firstChar = variable.name.substring(0, 1);
            if (firstChar.toUpperCase() === firstChar) {
                accept('warning', 'Variable name should NOT start with a capital.', { node: variable, property: 'name' });
            }
        }
    }

}
