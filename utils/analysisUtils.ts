
import { Node, Edge, MarkerType, Position } from 'reactflow';
import { SopResponse } from '../types';
import { DUMMY_PROCESS_ANALYSIS_DATA } from '../constants';

// Type mapping for the custom filter
export type FlowNodeType = 'process' | 'data' | 'risk' | 'control' | 'output';

export const convertSopToAnalysisData = (data: SopResponse) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!data || !data.processFlow || !data.processFlow.stages) {
        return { nodes: [], edges: [] };
    }

    const COL_WIDTH = 400; // Horizontal space between columns
    const COL_L2 = 0;
    const COL_DATA = 400;
    const COL_RISK = 800;
    const COL_CTRL = 1200;
    const COL_OUTPUT = 1600;

    let currentY = 100; // Start Y position

    data.processFlow.stages.forEach((stage, index) => {
        const stagePrefix = `l2-${index + 1}`;
        
        // Collect items for this stage
        const inputItems: string[] = [];
        const riskItems: string[] = [];
        const controlItems: string[] = [];
        const outputItems: string[] = [];

        stage.steps.forEach(s => {
            // Inputs
            const desc = s.description.toLowerCase();
            const type = s.stepType.toLowerCase();
            if (type.includes('input') || type.includes('capture') || desc.includes('provide') || desc.includes('submit')) {
                if (s.stepName && !inputItems.includes(s.stepName)) inputItems.push(s.stepName);
            }

            // Risks
            if (s.risksMitigated) {
                s.risksMitigated.forEach(rId => {
                    const riskDef = data.inherentRisks.find(ir => ir.riskId === rId);
                    const label = riskDef ? `${riskDef.riskType || riskDef.category}` : rId;
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
            if (desc.includes('generate') || desc.includes('create') || desc.includes('output') || desc.includes('result') || desc.includes('record')) {
                 const label = s.stepName + " Record";
                 if (!outputItems.includes(label)) outputItems.push(label);
            }
        });

        // Defaults if empty
        if (inputItems.length === 0) inputItems.push("Standard Stage Inputs");
        if (riskItems.length === 0) riskItems.push("Operational Risk");
        if (controlItems.length === 0) controlItems.push("Standard Control");
        // Output can be empty or 'None'
        if (outputItems.length === 0) outputItems.push("Stage Completion");

        // Calculate heights to vertically center items relative to L2 Node
        const maxItems = Math.max(inputItems.length, riskItems.length, controlItems.length, outputItems.length);
        const verticalSpread = 100; // Space between items in the same column
        const stageHeight = Math.max(200, maxItems * verticalSpread);
        const stageCenterY = currentY + (stageHeight / 2) - 50; // -50 roughly half node height

        // 1. L2 Process Node (Centered)
        const l2NodeId = stagePrefix;
        nodes.push({
            id: l2NodeId,
            data: { label: `${index + 1}. ${stage.stageName}` },
            position: { x: COL_L2, y: stageCenterY },
            type: 'default', 
            className: 'l2-process-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // Helper to Create Column Nodes
        const createColumnNodes = (items: string[], colX: number, type: 'data' | 'risk' | 'control' | 'output') => {
            const ids: string[] = [];
            const totalHeight = items.length * verticalSpread;
            let startY = stageCenterY - (totalHeight / 2) + 50; // Center group relative to L2

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

        // Edges: Fan Out / Fan In
        // L2 -> All Data
        dataIds.forEach(id => edges.push({ id: `e-${l2NodeId}-${id}`, source: l2NodeId, target: id, type: 'step', style: { stroke: '#94a3b8' } }));
        
        // Data -> All Risks (Simplification: Mesh)
        dataIds.forEach(src => {
            riskIds.forEach(tgt => {
                edges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'step', style: { stroke: '#f43f5e', opacity: 0.5 } });
            });
        });

        // Risks -> All Controls
        riskIds.forEach(src => {
            controlIds.forEach(tgt => {
                edges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'step', style: { stroke: '#10b981', opacity: 0.5 } });
            });
        });

        // Controls -> All Outputs
        controlIds.forEach(src => {
            outputIds.forEach(tgt => {
                edges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'step', style: { stroke: '#8b5cf6', opacity: 0.5 } });
            });
        });

        // Advance Y for next stage
        currentY += stageHeight + 100; // Gap between stages
    });

    return { nodes, edges };
};

/**
 * Filters and re-layouts the dummy data based on selected column types.
 * @param selectedTypes Array of selected node types in desired order.
 */
export const filterDummyData = (selectedTypes: FlowNodeType[]) => {
    // 1. Config
    const COL_WIDTH = 400;
    const CLASS_MAP: Record<FlowNodeType, string> = {
        'process': 'l2-process-node',
        'data': 'data-node',
        'risk': 'risk-node',
        'control': 'control-node',
        'output': 'output-node'
    };

    // 2. Filter Nodes
    const originalNodes = DUMMY_PROCESS_ANALYSIS_DATA.nodes;
    const selectedClasses = selectedTypes.map(t => CLASS_MAP[t]);
    
    // Create a map of rowId -> { type -> nodes[] }
    // We assume ID structure: prefix-ROWid... e.g. "l2-1", "risk-1a"
    // For output, it might be output-1.
    const rowMap: Record<string, Record<string, any[]>> = {};

    const filteredNodes = originalNodes.filter(n => {
        return selectedClasses.includes(n.className);
    }).map(n => {
        // Determine new X position
        // Find which column index this node belongs to based on its class
        const typeIndex = selectedTypes.findIndex(t => CLASS_MAP[t] === n.className);
        const newX = typeIndex * COL_WIDTH;
        
        // Extract Row ID for edge generation later
        // Regex looks for the first number after a hyphen
        const match = n.id.match(/-(\d+)/);
        const rowId = match ? match[1] : 'unknown';
        
        if (!rowMap[rowId]) rowMap[rowId] = {};
        if (!rowMap[rowId][n.className]) rowMap[rowId][n.className] = [];
        rowMap[rowId][n.className].push(n.id);

        return {
            ...n,
            position: {
                ...n.position,
                x: newX
            }
        };
    });

    // 3. Generate Edges
    const newEdges: any[] = [];
    
    // For each row, connect columns in the order of selectedTypes
    Object.keys(rowMap).forEach(rowId => {
        const rowData = rowMap[rowId];
        
        // Iterate through selected columns to create links between adjacent selections
        for (let i = 0; i < selectedTypes.length - 1; i++) {
            const sourceType = selectedTypes[i];
            const targetType = selectedTypes[i+1];
            
            const sourceClass = CLASS_MAP[sourceType];
            const targetClass = CLASS_MAP[targetType];

            const sourceIds = rowData[sourceClass] || [];
            const targetIds = rowData[targetClass] || [];

            // Create Full Mesh connections between adjacent columns in the same row
            // (e.g. Data Node connects to all Risks in that row)
            sourceIds.forEach((srcId: string) => {
                targetIds.forEach((tgtId: string) => {
                    newEdges.push({
                        id: `e-${srcId}-${tgtId}`,
                        source: srcId,
                        target: tgtId,
                        type: 'step',
                        style: { stroke: '#94a3b8', strokeWidth: 2 },
                        animated: false
                    });
                });
            });
        }
    });

    return { nodes: filteredNodes, edges: newEdges };
};
