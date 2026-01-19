
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

    const X_GAP = 400; // Horizontal gap between stages
    const Y_START = 0;
    const Y_GAP = 100; // Vertical gap between nodes

    data.processFlow.stages.forEach((stage, index) => {
        const xPos = index * X_GAP; // In real flow, usually we layout horizontally for L2? No, this function generates Vertical stages? 
        // Wait, the dummy data is Row based. This function generates 1 column per stage.
        // Let's stick to the column structure: 1 column per L2 process containing all its attributes vertically.
        // Actually, the dummy data puts L2, Data, Risk, Control in separate columns horizontally.
        // Let's follow the dummy data structure for consistency.
        
        // Structure: Rows = Stages. Columns = Type.
        // Y position = index * 400 (approx height of row)
        // X position = Fixed based on Type.
        
        const rowY = index * 400 + 100;
        const COL_L2 = 0;
        const COL_DATA = 400;
        const COL_RISK = 800;
        const COL_CTRL = 1200;
        const COL_OUTPUT = 1600;

        const stagePrefix = `l2-${index + 1}`;

        // 1. Process Node (L2)
        nodes.push({
            id: stagePrefix,
            data: { label: `${index + 1}. ${stage.stageName}` },
            position: { x: COL_L2, y: rowY },
            type: 'default', 
            className: 'l2-process-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // 2. Data Node (Inputs)
        let dataLabels: string[] = [];
        stage.steps.forEach(s => {
            const desc = s.description.toLowerCase();
            const type = s.stepType.toLowerCase();
            if (type.includes('input') || type.includes('capture') || desc.includes('provide') || desc.includes('submit')) {
                if (s.stepName.length < 40) dataLabels.push(s.stepName);
            }
        });
        if (dataLabels.length === 0) dataLabels.push("Standard Stage Inputs");
        const uniqueData = Array.from(new Set(dataLabels)).slice(0, 3).join('\n');

        nodes.push({
            id: `data-${index + 1}`,
            data: { label: uniqueData || "Data Inputs" },
            position: { x: COL_DATA, y: rowY },
            className: 'data-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // 3. Risk Node
        let risks: string[] = [];
        let riskIds: string[] = [];
        stage.steps.forEach(s => {
            if (s.risksMitigated) {
                s.risksMitigated.forEach(rId => {
                    riskIds.push(rId);
                    const riskDef = data.inherentRisks.find(ir => ir.riskId === rId);
                    if (riskDef) risks.push(riskDef.category); 
                });
            }
        });
        const uniqueRiskCats = Array.from(new Set(risks)).slice(0, 2).join(' / ');
        const riskLabel = uniqueRiskCats ? `${uniqueRiskCats} Risk` : "Operational Risk";

        nodes.push({
            id: `risk-${index + 1}`,
            data: { label: riskLabel },
            position: { x: COL_RISK, y: rowY },
            className: 'risk-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // 4. Control Node
        let controls: string[] = [];
        stage.steps.forEach(s => {
            if (s.controls) {
                s.controls.forEach(c => controls.push(c.name));
            }
        });
        const uniqueControls = Array.from(new Set(controls)).slice(0, 2).join('\n');

        nodes.push({
            id: `control-${index + 1}`,
            data: { label: uniqueControls || "Standard Controls" },
            position: { x: COL_CTRL, y: rowY },
            className: 'control-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // 5. Output Node (Data Produced) - Synthetic/Heuristic
        let outputLabels: string[] = [];
        stage.steps.forEach(s => {
             const desc = s.description.toLowerCase();
             if (desc.includes('generate') || desc.includes('create') || desc.includes('output') || desc.includes('result')) {
                 outputLabels.push(s.stepName + " Record");
             }
        });
        if (outputLabels.length === 0) outputLabels.push("Stage Completion Record");
        const uniqueOutput = Array.from(new Set(outputLabels)).slice(0, 2).join('\n');

        nodes.push({
            id: `output-${index + 1}`,
            data: { label: uniqueOutput },
            position: { x: COL_OUTPUT, y: rowY },
            className: 'output-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // --- Edges within the row (Left to Right) ---
        edges.push({ id: `e-${stagePrefix}-data`, source: stagePrefix, target: `data-${index + 1}`, type: 'step', style: { stroke: '#94a3b8' } });
        edges.push({ id: `e-data-risk-${index + 1}`, source: `data-${index + 1}`, target: `risk-${index + 1}`, type: 'step', style: { stroke: '#f43f5e' } });
        edges.push({ id: `e-risk-control-${index + 1}`, source: `risk-${index + 1}`, target: `control-${index + 1}`, type: 'step', style: { stroke: '#10b981' } });
        edges.push({ id: `e-control-output-${index + 1}`, source: `control-${index + 1}`, target: `output-${index + 1}`, type: 'step', style: { stroke: '#8b5cf6' } });
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
