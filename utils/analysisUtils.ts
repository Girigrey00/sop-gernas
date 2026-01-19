
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
        const rowY = index * 300; 
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

        const edgeStyle = { stroke: '#94a3b8', strokeWidth: 2 };
        const commonEdgeProps = { type: 'smoothstep', style: edgeStyle, pathOptions: { borderRadius: 20 } };

        edges.push({ id: `e-${stagePrefix}-d`, source: stagePrefix, target: `data-${index + 1}`, ...commonEdgeProps });
        edges.push({ id: `e-d-r${index}`, source: `data-${index + 1}`, target: `risk-${index + 1}`, ...commonEdgeProps });
        edges.push({ id: `e-r-c${index}`, source: `risk-${index + 1}`, target: `control-${index + 1}`, ...commonEdgeProps });
        edges.push({ id: `e-c-o${index}`, source: `control-${index + 1}`, target: `output-${index + 1}`, ...commonEdgeProps });
    });

    return { nodes, edges };
};

/**
 * Grid Layout Engine for Dummy Data
 */
export const filterDummyData = (selectedTypes: FlowNodeType[]) => {
    // LAYOUT CONSTANTS
    const COL_WIDTH = 400; // Increased spacing between columns
    const NODE_H = 120;    // Standard node height assumption for layout slots
    const ROW_PADDING = 60; 

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
    const rowGroups: Record<string, Record<FlowNodeType, Node[]>> = {};
    const rowIndices: number[] = [];

    originalNodes.forEach(node => {
        if (!selectedClasses.includes(node.className)) return;

        // Extract Row Index
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
            // @ts-ignore
            rowGroups[rowIndex][type].push(node);
        }
    });

    // Sort rows numerically
    rowIndices.sort((a, b) => a - b);

    // 2. Calculate Layout Positions
    const layoutNodes: Node[] = [];
    let currentY = 50; // Start Y

    rowIndices.forEach(rowIndex => {
        const row = rowGroups[rowIndex];
        
        // Sort nodes within each type group alphabetically by ID to ensure A comes before B
        // This is crucial for parallel edge alignment (Risk A -> Control A)
        selectedTypes.forEach(type => {
            row[type].sort((a, b) => a.id.localeCompare(b.id));
        });

        // Find maximum items in any visible column for this row to determine Row Height
        let maxItemsInRow = 0;
        selectedTypes.forEach(type => {
            const count = row[type].length;
            if (count > maxItemsInRow) maxItemsInRow = count;
        });

        if (maxItemsInRow === 0) maxItemsInRow = 1;

        const rowBlockHeight = maxItemsInRow * NODE_H;
        
        // The Y center of this entire row block
        const rowCenterY = currentY + (rowBlockHeight / 2);

        // Position nodes for this row
        selectedTypes.forEach((type, colIndex) => {
            const nodesInCell = row[type];
            const count = nodesInCell.length;
            
            if (count === 0) return;

            // Calculate height occupied by these nodes
            const totalCellHeight = count * NODE_H;
            
            // Start Y to center this group within the row block
            // offset so the middle of totalCellHeight aligns with rowCenterY
            let startNodeY = rowCenterY - (totalCellHeight / 2);

            nodesInCell.forEach((node, nodeIdx) => {
                // We want the node's vertical center to be at startNodeY + half_node_height
                // Position in ReactFlow is top-left.
                // Assuming visual center logic:
                const nodeTopY = startNodeY + (nodeIdx * NODE_H) + ((NODE_H - 80) / 2); // 80 is roughly card min-height

                layoutNodes.push({
                    ...node,
                    position: {
                        x: colIndex * COL_WIDTH,
                        y: nodeTopY
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    // Force refresh
                    data: { ...node.data }
                } as Node);
            });
        });

        // Increment Y for next row
        currentY += rowBlockHeight + ROW_PADDING;
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

            // Get nodes (already sorted by ID above)
            const sourceNodes = row[sourceType];
            const targetNodes = row[targetType];

            if (sourceNodes.length === 0 || targetNodes.length === 0) continue;

            sourceNodes.forEach((srcNode, srcIdx) => {
                if (!nodeMap.has(srcNode.id)) return;

                targetNodes.forEach((tgtNode, tgtIdx) => {
                    if (!nodeMap.has(tgtNode.id)) return;

                    let shouldConnect = false;

                    // Matching Logic
                    
                    // Case 1: N to N (Equal count) -> Parallel 1-to-1 lines
                    // Since both arrays are sorted by ID, index matching works perfectly for visual parallelism
                    if (sourceNodes.length === targetNodes.length) {
                        if (srcIdx === tgtIdx) shouldConnect = true;
                    } 
                    // Case 2: 1 to N -> Fan Out
                    else if (sourceNodes.length === 1) {
                        shouldConnect = true;
                    }
                    // Case 3: N to 1 -> Fan In
                    else if (targetNodes.length === 1) {
                        shouldConnect = true;
                    }
                    // Case 4: M to N (Uneven) -> Heuristic matching
                    else {
                        // Match suffixes if available (e.g. risk-1a -> ctrl-1a)
                        const srcSuffix = srcNode.id.match(/[a-z]$/i)?.[0];
                        const tgtSuffix = tgtNode.id.match(/[a-z]$/i)?.[0];
                        
                        if (srcSuffix && tgtSuffix && srcSuffix === tgtSuffix) {
                            shouldConnect = true;
                        } 
                        // Demo-specific override for explicit multi-link scenario in dummy data
                        else if (srcNode.id === 'risk-2a' && tgtNode.id === 'ctrl-2b') {
                            // Example: Risk 2a connects to Ctrl 2b (Cross-link)
                            shouldConnect = true;
                        }
                        else if (srcNode.id === 'risk-7b' && tgtNode.id === 'ctrl-7a') {
                            shouldConnect = true;
                        }
                    }

                    if (shouldConnect) {
                        layoutEdges.push({
                            id: `e-${srcNode.id}-${tgtNode.id}`,
                            source: srcNode.id,
                            target: tgtNode.id,
                            type: 'smoothstep',
                            pathOptions: { borderRadius: 20 },
                            style: { stroke: '#94a3b8', strokeWidth: 2 },
                            animated: false,
                            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
                        });
                    }
                });
            });
        }
    });

    return { nodes: layoutNodes, edges: layoutEdges };
};
