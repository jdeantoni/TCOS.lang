import { SoSSpec, RuleOpening, RWRule } from '../generated/ast';
import { GeneratorContext, LangiumDiagramGenerator } from 'langium-sprotty';
import { SEdge, SLabel, SModelRoot, SNode, SPort } from 'sprotty-protocol';


export class StatesDiagramGenerator extends LangiumDiagramGenerator {

    protected generateRoot(args: GeneratorContext<SoSSpec>): SModelRoot {
        const { document } = args;
        const  spec : SoSSpec = document.parseResult.value;
        return {
            type: 'graph',
            id: spec.name ?? 'root',
            children: [
                ...spec.rtdAndRules.map( s => this.generateNode(s, args)),
                ...spec.rtdAndRules.flatMap(s => s.rules).map(t => this.generateEdge(t, args))
            ]
        };
    }

    protected generateNode(rule: RuleOpening, { idCache }: GeneratorContext<SoSSpec>): SNode {
        const nodeId = idCache.uniqueId(rule.name, rule);
        return {
            type: 'node',
            id: nodeId,
            children: [
                <SLabel>{
                    type: 'label',
                    id: idCache.uniqueId(nodeId + '.label'),
                    text: rule.name
                },
                <SPort>{
                    type: 'port',
                    id: idCache.uniqueId(nodeId + '.newTransition')
                }
            ],
            layout: 'stack',
            layoutOptions: {
                paddingTop: 10.0,
                paddingBottom: 10.0,
                paddingLeft: 10.0,
                paddingRight: 10.0
            }
        };
    }

    protected generateEdge(rule: RWRule, { idCache }: GeneratorContext<SoSSpec>): SEdge {
        const sourceId = idCache.getId(rule.$container);
        const targetId = idCache.getId(rule.$container);
        const edgeId = idCache.uniqueId(`${sourceId}:${rule.guardEvents?.map(e => e.$type)}:${targetId}`, rule);
        return {
            type: 'edge',
            id: edgeId,
            sourceId: sourceId!,
            targetId: targetId!,
            children: [
                <SLabel>{
                    type: 'label:xref',
                    id: idCache.uniqueId(edgeId + '.label'),
                    text: rule.name
                }
            ]
        };
    }

}
