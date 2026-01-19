import { Node, Edge, MarkerType, Position } from 'reactflow';
import { SopResponse } from '../types';
import { DUMMY_PROCESS_ANALYSIS_DATA } from '../constants';

// Type mapping for the custom filter
export type FlowNodeType = 'process' | 'data' | 'risk' | 'control' | 'output';

export const convertSopToAnalysisData = (data: SopResponse) => {
    // Basic conversion for real API data - mostly linear
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!data || !data.processFlow || !data.processFlow.stages) {
        return { nodes: [], edges: [] };
    }

    const COL_PROCESS = 0;
    const COL_DATA = 400;
    const COL_RISK = 800;
    const COL_CONTROL = 1200;
    const COL_OUTPUT = 1600;

    data.processFlow.stages.forEach((stage, index) => {
        const rowY = index * 250; // Simple spacing for real data
        const stagePrefix = `l2-${index + 1}`;

        nodes.push({
            id: stagePrefix,
            data: { label: `${index + 1}. ${stage.stageName}` },
            position: { x: COL_PROCESS, y: rowY },
            type: 'default', 
            className: 'l2-process-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // Simplified extraction for real data visualization
        let dataLabels: string[] = [];
        stage.steps.forEach(s => {
            if (s.stepType.toLowerCase().includes('input') || s.description.toLowerCase().includes('details')) {
                dataLabels.push(s.stepName);
            }
        });
        const uniqueData = Array.from(new Set(dataLabels)).slice(0, 3).join('\n');

        nodes.push({
            id: `data-${index + 1}`,
            data: { label: uniqueData || "Standard Inputs" },
            position: { x: COL_DATA, y: rowY },
            className: 'data-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        let riskLabel = "Operational Risk";
        if(data.inherentRisks.length > 0) riskLabel = data.inherentRisks[index % data.inherentRisks.length].riskType;

        nodes.push({
            id: `risk-${index + 1}`,
            data: { label: riskLabel },
            position: { x: COL_RISK, y: rowY },
            className: 'risk-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        nodes.push({
            id: `control-${index + 1}`,
            data: { label: "Standard Controls" },
            position: { x: COL_CONTROL, y: rowY },
            className: 'control-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        nodes.push({
            id: `output-${index + 1}`,
            data: { label: "Process Record" },
            position: { x: COL_OUTPUT, y: rowY },
            className: 'output-node',
            sourcePosition: Position.Right,
            targetPosition: Position.Left
        });

        // Edges
        const edgeStyle = { stroke: '#94a3b8', strokeWidth: 1.5 };
        edges.push({ id: `e-${stagePrefix}-d`, source: stagePrefix, target: `data-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        edges.push({ id: `e-d-r${index}`, source: `data-${index + 1}`, target: `risk-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        edges.push({ id: `e-r-c${index}`, source: `risk-${index + 1}`, target: `control-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        edges.push({ id: `e-c-o${index}`, source: `control-${index + 1}`, target: `output-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        
        // Sequence
        if (index < data.processFlow.stages.length - 1) {
             edges.push({
                id: `seq-${index}`,
                source: stagePrefix,
                target: `l2-${index + 2}`,
                type: 'smoothstep',
                style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
            });
        }
    });

    return { nodes, edges };
};

/**
 * Grid Layout Engine for Dummy Data
 * Positions nodes based on Row Groups to ensure perfect horizontal alignment and clear vertical spacing.
 */
export const filterDummyData = (selectedTypes: FlowNodeType[]) => {
    const COL_WIDTH = 400; // Horizontal space between columns
    const NODE_H = 100;    // Approximate node height including padding
    const ROW_PADDING = 50; // Vertical padding between rows

    const CLASS_MAP: Record<FlowNodeType, string> = {
        'process': 'l2-process-node',
        'data': 'data-node',
        'risk': 'risk-node',
        'control': 'control-node',
        'output': 'output-node'
    };

    const originalNodes = DUMMY_PROCESS_ANALYSIS_DATA.nodes;
    const selectedClasses = selectedTypes.map(t => CLASS_MAP[t]);

    // 1. Group Nodes by Row ID
    // We assume ID pattern like "risk-1a" where '1' is the row index.
    const rowGroups: Record<string, Record<FlowNodeType, Node[]>> = {};
    const rowIndices: number[] = [];

    originalNodes.forEach(node => {
        if (!selectedClasses.includes(node.className)) return;

        // Extract Row Index (the number after the first hyphen)
        const match = node.id.match(/-(\d+)/);
        if (!match) return;
        const rowIndex = parseInt(match[1]);

        if (!rowGroups[rowIndex]) {
            rowGroups[rowIndex] = { process: [], data: [], risk: [], control: [], output: [] };
            rowIndices.push(rowIndex);
        }

        // Identify Type
        let type: FlowNodeType | undefined;
        if (node.className.includes('process')) type = 'process';
        else if (node.className.includes('data')) type = 'data';
        else if (node.className.includes('risk')) type = 'risk';
        else if (node.className.includes('control')) type = 'control';
        else if (node.className.includes('output')) type = 'output';

        if (type) {
            // @ts-ignore - We know node matches Node structure closely enough for this internal logic, will cast properly on output
            rowGroups[rowIndex][type].push(node);
        }
    });

    // Sort row indices
    rowIndices.sort((a, b) => a - b);

    // 2. Calculate Layout Positions
    const layoutNodes: Node[] = [];
    let currentY = 50; // Start Y

    rowIndices.forEach(rowIndex => {
        const row = rowGroups[rowIndex];
        
        // Find maximum items in any visible column for this row to determine Row Height
        let maxItemsInRow = 0;
        selectedTypes.forEach(type => {
            const count = row[type].length;
            if (count > maxItemsInRow) maxItemsInRow = count;
        });

        const rowHeight = maxItemsInRow * NODE_H;
        
        // Position nodes for this row
        selectedTypes.forEach((type, colIndex) => {
            const nodesInCell = row[type];
            const count = nodesInCell.length;
            
            if (count === 0) return;

            // Calculate vertical center for this cell
            const cellCenterY = currentY + (rowHeight / 2);
            
            // Distribute nodes around the center
            const totalCellHeight = count * NODE_H;
            let startNodeY = cellCenterY - (totalCellHeight / 2) + (NODE_H / 2); // Center of first node

            nodesInCell.forEach((node, nodeIdx) => {
                layoutNodes.push({
                    ...node,
                    position: {
                        x: colIndex * COL_WIDTH,
                        y: startNodeY + (nodeIdx * NODE_H) - (NODE_H / 2) // Adjust for top-left anchor vs center logic
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    // Force re-render with new styles if needed
                    data: { ...node.data } 
                } as Node);
            });
        });

        // Increment Y for next row
        currentY += rowHeight + ROW_PADDING;
    });

    // 3. Generate Smart Edges
    const layoutEdges: Edge[] = [];
    const nodeMap = new Map(layoutNodes.map(n => [n.id, n]));

    rowIndices.forEach(rowIndex => {
        const row = rowGroups[rowIndex];

        // Connect adjacent visible columns
        for (let i = 0; i < selectedTypes.length - 1; i++) {
            const sourceType = selectedTypes[i];
            const targetType = selectedTypes[i+1];

            const sourceNodes = row[sourceType];
            const targetNodes = row[targetType];

            if (sourceNodes.length === 0 || targetNodes.length === 0) continue;

            // Heuristic Connection Logic:
            // 1. If 1-to-1: Connect directly.
            // 2. If 1-to-Many: Connect the 1 to all Many.
            // 3. If Many-to-1: Connect all Many to the 1.
            // 4. If Many-to-Many (e.g. 2 Risks, 2 Controls): 
            //    - Try to match indices (1st to 1st, 2nd to 2nd) 
            //    - OR check if IDs suggest relation (risk-1a -> ctrl-1a).

            sourceNodes.forEach((srcNode, srcIdx) => {
                // Check if node is in layout (might have been filtered out but still in group)
                if (!nodeMap.has(srcNode.id)) return;

                targetNodes.forEach((tgtNode, tgtIdx) => {
                    if (!nodeMap.has(tgtNode.id)) return;

                    let shouldConnect = false;

                    // Logic 4: Smart Matching based on suffixes (a, b, etc.)
                    const srcSuffix = srcNode.id.match(/[a-z]$/i)?.[0];
                    const tgtSuffix = tgtNode.id.match(/[a-z]$/i)?.[0];

                    if (sourceNodes.length > 1 && targetNodes.length > 1) {
                        // If both have suffixes, match by suffix (e.g. risk-1a -> ctrl-1a)
                        if (srcSuffix && tgtSuffix) {
                            if (srcSuffix === tgtSuffix) shouldConnect = true;
                        } 
                        // Fallback: Match by index if no suffixes
                        else if (srcIdx === tgtIdx) {
                            shouldConnect = true;
                        }
                    } else {
                        // Logic 1, 2, 3: Connect all (Fan Out / Fan In)
                        shouldConnect = true;
                    }

                    if (shouldConnect) {
                        layoutEdges.push({
                            id: `e-${srcNode.id}-${tgtNode.id}`,
                            source: srcNode.id,
                            target: tgtNode.id,
                            type: 'smoothstep',
                            style: { stroke: '#94a3b8', strokeWidth: 2 },
                            animated: false,
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
                        });
                    }
                });
            });
        }
    });

    // 4. Connect Processes Vertically (Sequence)
    if (selectedTypes.includes('process')) {
        for (let i = 0; i < rowIndices.length - 1; i++) {
            const currRow = rowIndices[i];
            const nextRow = rowIndices[i+1];
            
            const currProc = rowGroups[currRow]['process'][0];
            const nextProc = rowGroups[nextRow]['process'][0];

            if (currProc && nextProc && nodeMap.has(currProc.id) && nodeMap.has(nextProc.id)) {
                layoutEdges.push({
                    id: `seq-${currProc.id}-${nextProc.id}`,
                    source: currProc.id,
                    target: nextProc.id,
                    type: 'smoothstep',
                    style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                    // Connect bottom of current to top of next for Process Column specifically? 
                    // No, keep Left/Right flow, but dashed line implies sequence.
                    // Actually, for Process flow, Top/Bottom is better but we forced Right/Left.
                    // Let's stick to Right->Left but maybe curve it down.
                });
            }
        }
    }

    return { nodes: layoutNodes, edges: layoutEdges };
};
