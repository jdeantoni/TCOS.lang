import { ValidationAcceptor, ValidationChecks } from 'langium';
import type { ParLangAstType, Statement } from './generated/ast.js';
import { isStatement } from './generated/ast.js';
import type { ParLangServices } from './par-lang-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: ParLangServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.ParLangValidator;
    const checks: ValidationChecks<ParLangAstType> = {
        Statement: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class ParLangValidator {

    checkPersonStartsWithCapital(s: Statement, accept: ValidationAcceptor): void {
        if (isStatement(s)) {
            //console.log('validate statement:', s);
        }
    }

}
