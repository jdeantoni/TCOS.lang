import { ValidationAcceptor, ValidationChecks } from 'langium';
import { RWRule, SoSSpec, StructuralOperationalSemanticsAstType } from './generated/ast.js';
import type { StructuralOperationalSemanticsServices } from './structural-operational-semantics-module.js';

/**
 * Register custom validation checks.
 */
export function registerSoSValidationChecks(services: StructuralOperationalSemanticsServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.StructuralOperationalSemanticsValidator;
    const checks: ValidationChecks<StructuralOperationalSemanticsAstType> = {
        RWRule: validator.checkConclusionAssignmentSyntax
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

    checkConclusionAssignmentSyntax(rule: RWRule, accept: ValidationAcceptor): void {
        const conclusionText = rule.conclusion.$cstNode?.text;
        if (!conclusionText) {
            return;
        }

        // Likely typo: using '=' inside a conclusion where state modifications require ':='.
        const suspiciousAssignment = /\b[a-zA-Z_][\w.]*(?:\s*=\s*)(?:true|false|"[^"]*"|\d+)\s*;/.exec(conclusionText);
        if (suspiciousAssignment) {
            accept('warning', 'Use := for state modifications inside conclusions. `=` is parsed differently here.', {
                node: rule.conclusion
            });
        }
    }
} 
