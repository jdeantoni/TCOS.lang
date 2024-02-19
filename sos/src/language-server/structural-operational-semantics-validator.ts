import { ValidationAcceptor, ValidationChecks } from 'langium';
import { SoSSpec, StructuralOperationalSemanticsAstType } from './generated/ast.js';
import type { StructuralOperationalSemanticsServices } from './structural-operational-semantics-module.js';

/**
 * Register custom validation checks.
 */
export function registerSoSValidationChecks(services: StructuralOperationalSemanticsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.StructuralOperationalSemanticsValidator;
    const checks: ValidationChecks<StructuralOperationalSemanticsAstType> = {
        //Person: validator.checkPersonStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class StructuralOperationalSemanticsValidator {

    checkOK(spec:SoSSpec, accept:ValidationAcceptor): void {
        accept('info', 'OK', {node: spec, property: 'name'});
    }

    // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
    //     if (person.name) {
    //         const firstChar = person.name.substring(0, 1);
    //         if (firstChar.toUpperCase() !== firstChar) {
    //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
    //         }
    //     }
    // }

} 
