import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { FsmAstType, Person } from './generated/ast.js';
import type { FsmServices } from './fsm-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FsmServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.FsmValidator;
    const checks: ValidationChecks<FsmAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FsmValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
