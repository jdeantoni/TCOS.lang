import { ValidationAcceptor, ValidationChecks } from 'langium';
import { SimpleLAstType, Person } from './generated/ast';
import type { SimpleLServices } from './simple-l-module';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: SimpleLServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.SimpleLValidator;
    const checks: ValidationChecks<SimpleLAstType> = {
        Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class SimpleLValidator {

    checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
        if (person.name) {
            const firstChar = person.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
            }
        }
    }

}
