
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
        const rowY = index * 300; // Increased spacing for real data
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
        const edgeStyle = { stroke: '#94a3b8', strokeWidth: 2 };
        edges.push({ id: `e-${stagePrefix}-d`, source: stagePrefix, target: `data-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        edges.push({ id: `e-d-r${index}`, source: `data-${index + 1}`, target: `risk-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        edges.push({ id: `e-r-c${index}`, source: `risk-${index + 1}`, target: `control-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        edges.push({ id: `e-c-o${index}`, source: `control-${index + 1}`, target: `output-${index + 1}`, type: 'smoothstep', style: edgeStyle });
        
        // Sequence (Vertical) - omitted for cleaner look in this view
    });

    return { nodes, edges };
};

/**
 * Grid Layout Engine for Dummy Data
 * Positions nodes based on Row Groups to ensure perfect horizontal alignment and clear vertical spacing.
 */
export const filterDummyData = (selectedTypes: FlowNodeType[]) => {
    // LAYOUT CONSTANTS - Increased to prevent overlaps
    const COL_WIDTH = 350; 
    const NODE_H = 180;    // Taller slot to fit content
    const ROW_PADDING = 80; // Space between process rows

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

    // Sort rows
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

        // Ensure minimum height for single items
        if (maxItemsInRow === 0) maxItemsInRow = 1;

        const rowHeight = maxItemsInRow * NODE_H;
        
        // Center Line of this row
        const rowCenterY = currentY + (rowHeight / 2);

        // Position nodes for this row
        selectedTypes.forEach((type, colIndex) => {
            const nodesInCell = row[type];
            const count = nodesInCell.length;
            
            if (count === 0) return;

            // Distribute nodes around the center of the row
            const totalCellHeight = count * NODE_H;
            // Top Y of the block of nodes in this cell
            const blockTopY = rowCenterY - (totalCellHeight / 2);

            nodesInCell.forEach((node, nodeIdx) => {
                // Center the node within its slot
                const nodeSlotY = blockTopY + (nodeIdx * NODE_H);
                // We add a small offset to center the specific card height (approx 100px) within the 180px slot
                const nodeY = nodeSlotY + 40; 

                layoutNodes.push({
                    ...node,
                    position: {
                        x: colIndex * COL_WIDTH,
                        y: nodeY
                    },
                    sourcePosition: Position.Right,
                    targetPosition: Position.Left,
                    // Force refresh
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

            sourceNodes.forEach((srcNode, srcIdx) => {
                if (!nodeMap.has(srcNode.id)) return;

                targetNodes.forEach((tgtNode, tgtIdx) => {
                    if (!nodeMap.has(tgtNode.id)) return;

                    let shouldConnect = false;

                    // Matching Logic
                    // 1. If N to N (equal count), match 1-to-1 by index
                    // 2. If 1 to N, connect 1 to All
                    // 3. If N to 1, connect All to 1
                    // 4. Special Case: Match suffixes (a->a, b->b) if present for accurate mapping
                    
                    const srcSuffix = srcNode.id.match(/[a-z]$/i)?.[0];
                    const tgtSuffix = tgtNode.id.match(/[a-z]$/i)?.[0];

                    if (sourceNodes.length > 1 && targetNodes.length > 1) {
                        if (srcSuffix && tgtSuffix) {
                            if (srcSuffix === tgtSuffix) shouldConnect = true;
                            // Special override for the multi-link demo in dummy data
                            // e.g. risk-7b connects to ctrl-7a
                            if (srcNode.id === 'risk-7b' && tgtNode.id === 'ctrl-7a') shouldConnect = true;
                            if (srcNode.id === 'risk-2a' && tgtNode.id === 'ctrl-2b') shouldConnect = true;
                        } 
                        else if (srcIdx === tgtIdx) {
                            shouldConnect = true;
                        }
                    } else {
                        // Fan In / Fan Out
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

    // NOTE: Removed vertical sequence edges to ensure clean Left-to-Right flow 
    // and prevent overlapping lines "somewhere".

    return { nodes: layoutNodes, edges: layoutEdges };
};
