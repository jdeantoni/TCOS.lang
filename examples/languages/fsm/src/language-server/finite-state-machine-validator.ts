// import { ValidationAcceptor, ValidationChecks } from 'langium';
// import { FiniteStateMachineAstType, Person } from './generated/ast';
// import type { FiniteStateMachineServices } from './finite-state-machine-module';

// /**
//  * Register custom validation checks.
//  */
// export function registerValidationChecks(services: FiniteStateMachineServices) {
//     const registry = services.validation.ValidationRegistry;
//     const validator = services.validation.FiniteStateMachineValidator;
//     // const checks: ValidationChecks<FiniteStateMachineAstType> = {
//     //     Person: validator.checkPersonStartsWithCapital
//     // };
//     // registry.register(checks, validator);
// }

// /**
//  * Implementation of custom validations.
//  */
// export class FiniteStateMachineValidator {

//     checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
//         if (person.name) {
//             const firstChar = person.name.substring(0, 1);
//             if (firstChar.toUpperCase() !== firstChar) {
//                 accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
//             }
//         }
//     }

// }
