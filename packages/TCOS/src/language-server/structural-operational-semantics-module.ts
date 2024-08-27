import {inject, Module } from 'langium';

import {createLangiumGrammarServices} from 'langium/grammar';

import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext,
    LangiumServices, LangiumSharedServices, PartialLangiumServices
} from 'langium/lsp';
import { registerValidationChecks } from '../../node_modules/langium/lib/grammar/validation/validator.js';

import { StructuralOperationalSemanticsGeneratedModule, StructuralOperationalSemanticsGeneratedSharedModule } from './generated/module.js';
import { StructuralOperationalSemanticsValidator, registerSoSValidationChecks } from './structural-operational-semantics-validator.js';
import { SoSScopeProvider } from './sos-scope.js';
// import { LangiumGrammarDocument } from 'langium/lib/grammar/workspace/documents';
import { registerTypeValidationChecks } from '../../node_modules/langium/lib/grammar/validation/types-validator.js';
import { SoSSemanticTokenProvider } from './structural-operational-semantics-semantic-token.js';


//import {LangiumGrammarGeneratedModule /*, LangiumGrammarGeneratedSharedModule*/ } from 'langium/src/grammar/generated/module';
//import { LangiumGrammarModule} from 'langium';


//import { SoSScopeComputation, SoSScopeProvider } from './sos-scope';




/**
 * Declaration of custom services - add your own service classes here.
 */
export type StructuralOperationalSemanticsAddedServices = {
    validation: {
        StructuralOperationalSemanticsValidator: StructuralOperationalSemanticsValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type StructuralOperationalSemanticsServices = LangiumServices & StructuralOperationalSemanticsAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const StructuralOperationalSemanticsModule: Module<StructuralOperationalSemanticsServices, PartialLangiumServices & StructuralOperationalSemanticsAddedServices> = {
    references: {
  //      ScopeComputation: (services) => new SoSScopeComputation(services),
        ScopeProvider: (services) => new SoSScopeProvider(services)//,
        // QualifiedNameProvider: () => new QualifiedNameProvider()
    },
    
    validation: {
        StructuralOperationalSemanticsValidator: () => new StructuralOperationalSemanticsValidator()
    },
    lsp: {
        SemanticTokenProvider: (services) => new SoSSemanticTokenProvider(services)
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
export function createStructuralOperationalSemanticsServices(context: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    langiumServices: LangiumServices,
    StructuralOperationalSemantics: StructuralOperationalSemanticsServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        StructuralOperationalSemanticsGeneratedSharedModule
    );
    const StructuralOperationalSemantics = inject(
        createDefaultModule({ shared }),
        StructuralOperationalSemanticsGeneratedModule,
        StructuralOperationalSemanticsModule
    );
    const langiumServices = /*inject(
        createDefaultModule({ shared }),
        LangiumGrammarGeneratedModule,
        LangiumGrammarModule
    );*/
    createLangiumGrammarServices(context).grammar


    // addTypeCollectionPhase(shared, langiumServices);
    shared.ServiceRegistry.register(langiumServices);

    registerValidationChecks(langiumServices);
    registerTypeValidationChecks(langiumServices);

    shared.ServiceRegistry.register(StructuralOperationalSemantics);
    registerSoSValidationChecks(StructuralOperationalSemantics);
    return { shared,langiumServices, StructuralOperationalSemantics };
}
// function addTypeCollectionPhase(sharedServices: LangiumSharedServices, grammarServices: LangiumGrammarServices) {
//     const documentBuilder = sharedServices.workspace.DocumentBuilder;
//     documentBuilder.onBuildPhase(DocumentState.IndexedReferences, async (documents, cancelToken) => {
//         for (const document of documents) {
//             await interruptAndCheck(cancelToken);
//             const typeCollector = grammarServices.validation.ValidationResourcesCollector;
//             const grammar = document.parseResult.value as Grammar;
//             (document as LangiumGrammarDocument).validationResources = typeCollector.collectValidationResources(grammar);
//         }
//     });
// }