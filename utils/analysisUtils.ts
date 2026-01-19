
import { Node, Edge, MarkerType, Position } from 'reactflow';
import { SopResponse } from '../types';
import { DUMMY_PROCESS_ANALYSIS_DATA } from '../constants';

// Type mapping for the custom filter
export type FlowNodeType = 'process' | 'data' | 'risk' | 'control' | 'output';

export const convertSopToAnalysisData = (data: SopResponse) => {
    // Basic converter for the automatic generation from API data
    // This logic creates a simple visualization.
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!data || !data.processFlow || !data.processFlow.stages) {
        return { nodes: [], edges: [] };
    }

    const COL_L2 = 0;
    const COL_DATA = 500;
    const COL_RISK = 1000;
    const COL_CTRL = 1500;
    const COL_OUTPUT = 2000;

    let currentY = 100;

    data.processFlow.stages.forEach((stage, index) => {
        const stagePrefix = `l2-${index + 1}`;
        
        // Collect items
        const inputItems: string[] = [];
        const riskItems: string[] = [];
        const controlItems: string[] = [];
        const outputItems: string[] = [];

        stage.steps.forEach(s => {
            // Inputs
            const desc = s.description.toLowerCase();
            const type = s.stepType.toLowerCase();
            if (type.includes('input') || type.includes('capture') || desc.includes('provide')) {
                if (s.stepName && !inputItems.includes(s.stepName)) inputItems.push(s.stepName);
            }
            // Risks
            if (s.risksMitigated) {
                s.risksMitigated.forEach(rId => {
                    const riskDef = data.inherentRisks.find(ir => ir.riskId === rId);
                    const label = riskDef ? `${riskDef.riskType}` : rId;
                    if (!riskItems.includes(label)) riskItems.push(label);
                });
            }
            // Controls
            if (s.controls) {
                s.controls.forEach(c => {
                    if (!controlItems.includes(c.name)) controlItems.push(c.name);
                });
            }
            // Outputs
            if (desc.includes('generate') || desc.includes('create') || desc.includes('record')) {
                 const label = s.stepName + " Record";
                 if (!outputItems.includes(label)) outputItems.push(label);
            }
        });

        // Defaults
        if (inputItems.length === 0) inputItems.push("Standard Input");
        if (riskItems.length === 0) riskItems.push("Operational Risk");
        if (controlItems.length === 0) controlItems.push("Standard Control");
        if (outputItems.length === 0) outputItems.push("Process Output");

        // Layout
        const maxItems = Math.max(inputItems.length, riskItems.length, controlItems.length, outputItems.length);
        const verticalSpread = 250; 
        const stageHeight = Math.max(300, maxItems * verticalSpread);
        const stageCenterY = currentY + (stageHeight / 2) - 50; 

        // L2 Node
        nodes.push({
            id: stagePrefix,
            data: { label: `${index + 1}. ${stage.stageName}` },
            position: { x: COL_L2, y: stageCenterY },
            type: 'default', 
            className: 'l2-process-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        const createColumnNodes = (items: string[], colX: number, type: 'data' | 'risk' | 'control' | 'output') => {
            const ids: string[] = [];
            let startY = stageCenterY - ((items.length * verticalSpread) / 2) + 50;

            items.forEach((item, i) => {
                const nodeId = `${type}-${index + 1}-${i}`;
                ids.push(nodeId);
                
                let className = '';
                if (type === 'data') className = 'data-node';
                if (type === 'risk') className = 'risk-node';
                if (type === 'control') className = 'control-node';
                if (type === 'output') className = 'output-node';

                nodes.push({
                    id: nodeId,
                    data: { label: item },
                    position: { x: colX, y: startY },
                    className: className,
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left
                });
                startY += verticalSpread;
            });
            return ids;
        };

        const dataIds = createColumnNodes(inputItems, COL_DATA, 'data');
        const riskIds = createColumnNodes(riskItems, COL_RISK, 'risk');
        const controlIds = createColumnNodes(controlItems, COL_CTRL, 'control');
        const outputIds = createColumnNodes(outputItems, COL_OUTPUT, 'output');

        // Edges (Simple Mesh)
        dataIds.forEach(id => edges.push({ id: `e-${stagePrefix}-${id}`, source: stagePrefix, target: id, type: 'step', style: { stroke: '#94a3b8' } }));
        dataIds.forEach(src => riskIds.forEach(tgt => edges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'step', style: { stroke: '#f43f5e', opacity: 0.5 } })));
        riskIds.forEach(src => controlIds.forEach(tgt => edges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'step', style: { stroke: '#10b981', opacity: 0.5 } })));
        controlIds.forEach(src => outputIds.forEach(tgt => edges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'step', style: { stroke: '#8b5cf6', opacity: 0.5 } })));

        currentY += stageHeight + 200;
    });

    return { nodes, edges };
};

/**
 * Enhanced Filter Logic to support N:1 Relationships without overlapping mesh lines.
 */
export const filterDummyData = (selectedTypes: FlowNodeType[]) => {
    // 1. Config
    const COL_WIDTH = 600; // Even wider columns
    const CLASS_MAP: Record<FlowNodeType, string> = {
        'process': 'l2-process-node',
        'data': 'data-node',
        'risk': 'risk-node',
        'control': 'control-node',
        'output': 'output-node'
    };

    const originalNodes = DUMMY_PROCESS_ANALYSIS_DATA.nodes;
    const selectedClasses = selectedTypes.map(t => CLASS_MAP[t]);
    
    // 2. Filter & Position Nodes
    const filteredNodes = originalNodes.filter(n => {
        return selectedClasses.includes(n.className);
    }).map(n => {
        const typeIndex = selectedTypes.findIndex(t => CLASS_MAP[t] === n.className);
        return {
            ...n,
            position: {
                ...n.position,
                x: typeIndex * COL_WIDTH
            }
        };
    });

    // 3. Smart Edge Generation
    const newEdges: any[] = [];
    const nodeMap = new Map(filteredNodes.map(n => [n.id, n]));

    // Helper: Extract Group ID (e.g., "5a" from "risk-5a1" or "5" from "data-5")
    const getGroupId = (id: string) => {
        // Match numbers optionally followed by a single letter (e.g., 5, 5a, 5b)
        const match = id.match(/-(\d+[a-z]?)/);
        return match ? match[1] : null;
    };

    // Helper: Check if groups are compatible
    const areGroupsCompatible = (srcGroup: string | null, tgtGroup: string | null) => {
        if (!srcGroup || !tgtGroup) return false;
        
        // Exact match (5a -> 5a)
        if (srcGroup === tgtGroup) return true;
        
        // Parent to Child (5 -> 5a)
        if (tgtGroup.startsWith(srcGroup) && srcGroup.length < tgtGroup.length) return true;
        
        // Child to Parent (5a -> 5) - usually not needed but good for converging
        if (srcGroup.startsWith(tgtGroup) && tgtGroup.length < srcGroup.length) return true;

        // General fallback: if steps match but subgroups differ (e.g. 5a -> 5b), DO NOT connect
        // This is the key fix for "One control multiple risks" isolation
        return false;
    };

    // Iterate through adjacent columns
    for (let i = 0; i < selectedTypes.length - 1; i++) {
        const sourceType = selectedTypes[i];
        const targetType = selectedTypes[i+1];
        
        const sourceClass = CLASS_MAP[sourceType];
        const targetClass = CLASS_MAP[targetType];

        const sourceNodes = filteredNodes.filter(n => n.className === sourceClass);
        const targetNodes = filteredNodes.filter(n => n.className === targetClass);

        sourceNodes.forEach(src => {
            const srcGroup = getGroupId(src.id);
            
            targetNodes.forEach(tgt => {
                const tgtGroup = getGroupId(tgt.id);
                
                if (areGroupsCompatible(srcGroup, tgtGroup)) {
                    newEdges.push({
                        id: `e-${src.id}-${tgt.id}`,
                        source: src.id,
                        target: tgt.id,
                        type: 'step',
                        style: { stroke: '#94a3b8', strokeWidth: 2 },
                        animated: false
                    });
                }
            });
        });
    }

    return { nodes: filteredNodes, edges: newEdges };
};
