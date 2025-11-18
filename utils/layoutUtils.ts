
import { Node, Edge, MarkerType } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// Constants
const NODE_WIDTH = 280;
const NODE_HEIGHT = 120; 
const X_GAP = 50;
const Y_GAP = 100;
const SWIMLANE_COL_WIDTH = 400;

/**
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number): Node => {
    let background = '#ffffff';
    let border = '1px solid #e2e8f0'; // slate-200
    let borderRadius = '8px';
    let borderLeft = '4px solid #64748b'; // default slate

    // Safety check for missing step data
    if (!step) return { id: 'error', position: { x: 0, y: 0 }, data: { label: 'Error' } };

    if (step.stepType === 'Decision') {
        background = '#fff7ed'; // orange-50
        border = '1px solid #fdba74'; // orange-300
        borderLeft = '4px solid #f97316'; // orange-500
        borderRadius = '12px';
    } else if (step.stepType === 'Control') {
        background = '#f0f9ff'; // sky-50
        border = '1px solid #7dd3fc'; // sky-300
        borderLeft = '4px solid #0ea5e9'; // sky-500
    } else if (step.actor === 'Customer') {
        background = '#fdf4ff'; // fuchsia-50
        border = '1px solid #d8b4fe'; // fuchsia-300
        borderLeft = '4px solid #c084fc'; // fuchsia-500
    } else if (step.stepType === 'Start') {
        background = '#ecfdf5'; // emerald-50
        border = '1px solid #6ee7b7';
        borderLeft = '4px solid #10b981';
        borderRadius = '20px';
    } else if (step.stepType === 'End') {
        background = '#fef2f2'; // red-50
        border = '1px solid #fca5a5';
        borderLeft = '4px solid #ef4444';
        borderRadius = '20px';
    }

    return {
        id: step.stepId,
        type: 'default', 
        data: { 
            label: step.stepName, 
            subline: step.actor,
            type: step.stepType,
            details: step 
        },
        position: { x, y },
        style: { 
            background, 
            border,
            borderLeft,
            borderRadius,
            width: NODE_WIDTH,
            padding: '12px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            textAlign: 'left',
            cursor: 'pointer'
        }
    };
};

/**
 * Helper to create edges
 */
const createEdges = (nodes: Node[], data: SopResponse, layoutType: LayoutType): Edge[] => {
    const edges: Edge[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Helper to add edge
    const addEdge = (source: string, target: string, label?: string, color: string = '#94a3b8') => {
        if (!source || !target) return;
        if (!nodeMap.has(source) || !nodeMap.has(target)) return;
        
        edges.push({
            id: `e-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
            source,
            target,
            label: label ? (label.length > 20 ? label.substring(0, 18) + '...' : label) : undefined,
            type: layoutType === 'SWIMLANE' ? 'smoothstep' : 'default',
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { stroke: color, strokeWidth: 1.5 },
            labelStyle: { fill: color, fontWeight: 600, fontSize: 10 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8, rx: 4, ry: 4 },
        });
    };

    // 1. Start -> First Step
    if (data.startNode && data.startNode.nextStep) {
        addEdge(data.startNode.stepId, data.startNode.nextStep, undefined, '#10b981');
    }

    // 2. Process Steps
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach(stage => {
            if (stage.steps) {
                stage.steps.forEach(step => {
                    // Linear Next
                    if (step.nextStep) {
                        if (step.stepType !== 'Decision' || !step.decisionBranches?.length) {
                            addEdge(step.stepId, step.nextStep);
                        }
                    }

                    // Decision Branches
                    if (step.decisionBranches) {
                        step.decisionBranches.forEach(branch => {
                            if (branch.nextStep) {
                                addEdge(step.stepId, branch.nextStep, branch.condition, '#f97316');
                            }
                        });
                    }
                });
            }
        });
    }

    return edges;
};


/**
 * Layout 1: Swimlane (Grouped by Stage)
 */
const getSwimlaneLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    if (!data.startNode) return nodes;

    nodes.push(createNode(data.startNode, 0, 0));

    let currentX = 0;
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach((stage) => {
            // Add Stage Header
            nodes.push({
                id: `stage-${stage.stageId}`,
                type: 'group', 
                data: { label: stage.stageName },
                position: { x: currentX, y: 80 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 20,
                    height: 40,
                    background: 'transparent',
                    borderBottom: '2px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#475569',
                    padding: '8px 0',
                    zIndex: -1
                },
                selectable: false,
                draggable: false
            });

            let currentY = 150;
            if (stage.steps) {
                stage.steps.forEach(step => {
                    nodes.push(createNode(step, currentX, currentY));
                    currentY += NODE_HEIGHT + 40;
                });
            }

            currentX += SWIMLANE_COL_WIDTH;
        });
    }

    // Only add end node if we had stages, otherwise place it near start
    let lastY = 250;
    let lastStageX = 0;
    
    if (data.processFlow && data.processFlow.stages && data.processFlow.stages.length > 0) {
        lastStageX = (data.processFlow.stages.length - 1) * SWIMLANE_COL_WIDTH;
        const lastStage = data.processFlow.stages[data.processFlow.stages.length - 1];
        if (lastStage && lastStage.steps) {
            lastY = 150 + (lastStage.steps.length * (NODE_HEIGHT + 40));
        }
    }

    if (data.endNode) {
        nodes.push(createNode(data.endNode, lastStageX, lastY));
    }

    return nodes;
};

/**
 * Helper for Tree Traversal (Vertical & Horizontal)
 */
const buildTreeLevels = (data: SopResponse) => {
    const levels: Record<string, number> = {};
    const stepMap = new Map<string, ProcessStep>();

    // Index all steps
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach(s => {
            if(s.steps) s.steps.forEach(st => stepMap.set(st.stepId, st));
        });
    }

    // BFS for Level Assignment
    if (!data.startNode) return { levels, stepMap };

    const queue: { id: string, level: number }[] = [{ id: data.startNode.stepId, level: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        
        levels[id] = level;

        const step = stepMap.get(id);
        if (!step) continue;

        const children: string[] = [];
        if (step.nextStep) children.push(step.nextStep);
        if (step.decisionBranches) {
            step.decisionBranches.forEach(b => {
                if (b.nextStep) children.push(b.nextStep);
            });
        }
        children.forEach(childId => queue.push({ id: childId, level: level + 1 }));
    }
    return { levels, stepMap };
};

/**
 * Layout 2: Vertical Tree (Decision Tree)
 * Recursive approach to handle branches more naturally
 */
const getDecisionTreeLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    const stepMap = new Map<string, ProcessStep>();
    
    // Populate map
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach(s => {
            if(s.steps) s.steps.forEach(st => stepMap.set(st.stepId, st));
        });
    }

    if (!data.startNode) return nodes;

    const visited = new Set<string>();
    // Track subtree widths to position parents
    const subtreeWidths = new Map<string, number>();

    // Post-order traversal to calculate widths
    const calculateWidths = (stepId: string): number => {
        if (visited.has(stepId)) return NODE_WIDTH + X_GAP; // Already visited, treat as single leaf size
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return 0;

        let childrenIds: string[] = [];
        if (step.decisionBranches && step.decisionBranches.length > 0) {
             childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        } else if (step.nextStep) {
            childrenIds = [step.nextStep];
        }

        if (childrenIds.length === 0) {
            subtreeWidths.set(stepId, NODE_WIDTH + X_GAP);
            return NODE_WIDTH + X_GAP;
        }

        let width = 0;
        childrenIds.forEach(child => {
             width += calculateWidths(child);
        });
        
        subtreeWidths.set(stepId, width);
        return width;
    };

    // Clear visited for second pass
    visited.clear();
    calculateWidths(data.startNode.stepId);
    visited.clear(); // Clear again for placement

    // Pre-order placement
    const placeNodes = (stepId: string, x: number, y: number) => {
        if (visited.has(stepId)) return; // Handle merges simply by skipping re-placement for now
        visited.add(stepId);

        const step = stepMap.get(stepId);
        if (!step) return;

        nodes.push(createNode(step, x, y));

        let childrenIds: string[] = [];
        if (step.decisionBranches && step.decisionBranches.length > 0) {
             childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        } else if (step.nextStep) {
            childrenIds = [step.nextStep];
        }

        // Calculate starting X for children block
        // Logic: The parent should be centered above the children block.
        // Children block width is sum of all children subtree widths.
        // The left-most child starts at (parentX - totalWidth/2) + firstChildWidth/2
        
        let currentX = x - (subtreeWidths.get(stepId)! / 2);
        
        childrenIds.forEach(childId => {
            const childWidth = subtreeWidths.get(childId) || (NODE_WIDTH + X_GAP);
            const childX = currentX + (childWidth / 2);
            placeNodes(childId, childX, y + NODE_HEIGHT + Y_GAP);
            currentX += childWidth;
        });
    };

    placeNodes(data.startNode.stepId, 0, 0);

    // Ensure End Node is placed if reachable but skipped by tree logic (e.g. strictly hierarchical)
    if (data.endNode && !visited.has(data.endNode.stepId)) {
         // Find max Y
         const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.y)) : 0;
         nodes.push(createNode(data.endNode, 0, maxY + NODE_HEIGHT + Y_GAP));
    }

    return nodes;
};

/**
 * Layout 3: Horizontal Tree
 */
const getHorizontalTreeLayout = (data: SopResponse): Node[] => {
    const { levels, stepMap } = buildTreeLevels(data);
    const nodes: Node[] = [];

    // Group by Level
    const nodesByLevel: Record<number, string[]> = {};
    Object.entries(levels).forEach(([id, level]) => {
        if (!nodesByLevel[level]) nodesByLevel[level] = [];
        nodesByLevel[level].push(id);
    });

    const maxLevel = Math.max(...Object.values(levels), 0);
    
    for (let l = 0; l <= maxLevel; l++) {
        const levelNodes = nodesByLevel[l] || [];
        const levelHeight = levelNodes.length * (NODE_HEIGHT + 50);
        let startY = -(levelHeight / 2); 

        levelNodes.forEach(nodeId => {
            const step = stepMap.get(nodeId);
            if (step) {
                // Swap X and Y logic from vertical tree
                // X expands with level, Y expands with index in level
                nodes.push(createNode(step, l * (NODE_WIDTH + 100), startY));
                startY += NODE_HEIGHT + 50;
            }
        });
    }
    return nodes;
};


export const convertSopToFlowData = (data: SopResponse, layoutType: LayoutType = 'SWIMLANE') => {
    let nodes: Node[] = [];

    // Validation
    if (!data || !data.startNode || !data.processFlow) {
        console.warn("Invalid data passed to layout converter");
        return { nodes: [], edges: [] };
    }

    try {
        switch (layoutType) {
            case 'TREE':
                nodes = getDecisionTreeLayout(data);
                break;
            case 'HORIZONTAL':
                nodes = getHorizontalTreeLayout(data);
                break;
            case 'SWIMLANE':
            default:
                nodes = getSwimlaneLayout(data);
                break;
        }

        const edges = createEdges(nodes, data, layoutType);
        return { nodes, edges };
    } catch (e) {
        console.error("Layout calculation error", e);
        return { nodes: [], edges: [] };
    }
};
