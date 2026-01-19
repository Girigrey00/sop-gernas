
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
    const COL_WIDTH = 350; 
    const SLOT_HEIGHT = 220; // Increased height per slot to accommodate detailed control text
    const GROUP_PADDING = 80; // Padding between Process Rows

    const CLASS_MAP: Record<FlowNodeType, string> = {
        'process': 'l2-process-node',
        'data': 'data-node',
        'risk': 'risk-node',
        'control': 'control-node',
        'output': 'output-node'
    };

    const originalNodes = DUMMY_PROCESS_ANALYSIS_DATA.nodes;
    const selectedClasses = selectedTypes.map(t => CLASS_MAP[t]);

    // 1. Group Nodes by Row ID (e.g. "1" from "risk-1a")
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
        
        // Determine the "Max Depth" of this row (e.g. if Risks=2, Controls=2 -> depth 2)
        let maxSlots = 1;
        selectedTypes.forEach(type => {
            const count = row[type].length;
            if (count > maxSlots) maxSlots = count;
        });

        // The total height of this row group
        const rowTotalHeight = maxSlots * SLOT_HEIGHT;
        // The vertical center line of this row
        const rowCenterY = currentY + (rowTotalHeight / 2);

        // Position nodes for this row
        selectedTypes.forEach((type, colIndex) => {
            const nodesInCell = row[type];
            if (nodesInCell.length === 0) return;

            // Sort nodes alphabetically by ID to ensure A matches A, B matches B
            // This aligns Risk-1a with Ctrl-1a naturally
            nodesInCell.sort((a, b) => a.id.localeCompare(b.id));

            // Are we filling all slots or centering few items?
            const isFullColumn = nodesInCell.length === maxSlots;

            nodesInCell.forEach((node, nodeIdx) => {
                let nodeY;
                
                if (isFullColumn) {
                    // Place exactly in the slot. 
                    // Slot 0 starts at currentY.
                    const slotTop = currentY + (nodeIdx * SLOT_HEIGHT);
                    nodeY = slotTop + (SLOT_HEIGHT / 2) - 40; // -40 approx half node height
                } else {
                    // Center the group of nodes relative to the entire Row Block
                    const blockHeight = nodesInCell.length * SLOT_HEIGHT;
                    const blockTop = rowCenterY - (blockHeight / 2);
                    const slotTop = blockTop + (nodeIdx * SLOT_HEIGHT);
                    nodeY = slotTop + (SLOT_HEIGHT / 2) - 40;
                }

                layoutNodes.push({
                    ...node,
                    position: {
                        x: colIndex * COL_WIDTH,
                        y: nodeY
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    data: { ...node.data }
                } as Node);
            });
        });

        // Increment Y for next row
        currentY += rowTotalHeight + GROUP_PADDING;
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

                    // --- Connection Logic ---
                    
                    // 1. Explicit Suffix Matching (e.g. Risk-1a -> Control-1a)
                    const srcSuffix = srcNode.id.match(/[a-z]$/i)?.[0];
                    const tgtSuffix = tgtNode.id.match(/[a-z]$/i)?.[0];

                    if (srcSuffix && tgtSuffix) {
                        // Strict horizontal connection for same suffix (Direct Line)
                        if (srcSuffix === tgtSuffix) shouldConnect = true;
                    } 
                    // 2. Fan Out: Source has NO suffix (Process/Data), Target HAS suffix (Risk/Control)
                    else if (!srcSuffix && tgtSuffix) {
                        shouldConnect = true; // Connect Process to All Risks
                    }
                    // 3. Fan In: Source HAS suffix (Risk/Control), Target has NO suffix (Output)
                    else if (srcSuffix && !tgtSuffix) {
                        shouldConnect = true; // Connect All Controls to Output
                    }
                    // 4. One-to-One: Neither has suffix (Process -> Data)
                    else if (!srcSuffix && !tgtSuffix) {
                        shouldConnect = true;
                    }

                    if (shouldConnect) {
                        layoutEdges.push({
                            id: `e-${srcNode.id}-${tgtNode.id}`,
                            source: srcNode.id,
                            target: tgtNode.id,
                            type: 'smoothstep',
                            pathOptions: { borderRadius: 20 },
                            style: { 
                                stroke: '#94a3b8', 
                                strokeWidth: 2,
                            },
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
