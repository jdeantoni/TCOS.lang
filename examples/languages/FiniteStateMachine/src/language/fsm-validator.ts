import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { FsmAstType, State } from './generated/ast.js';
import type { FsmServices } from './fsm-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: FsmServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.FsmValidator;
    const checks: ValidationChecks<FsmAstType> = {
        State: validator.checkStateStartsWithCapital
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class FsmValidator {

    checkStateStartsWithCapital(state: State, accept: ValidationAcceptor): void {
        if (state.name) {
            const firstChar = state.name.substring(0, 1);
            if (firstChar.toUpperCase() !== firstChar) {
                accept('warning', 'Person name should start with a capital.', { node: state, property: 'name' });
            }
        }
    }

}
