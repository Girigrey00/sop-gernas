
import { Node, Edge, MarkerType } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// Constants - Increased gaps to prevent overlaps
const NODE_WIDTH = 280;
const NODE_HEIGHT = 120; // Slightly taller for better text fit
const X_GAP = 150; // Increased Gap
const Y_GAP = 160; // Increased Gap for vertical breathing room
const SWIMLANE_COL_WIDTH = 850; // Much wider swimlanes to prevent cross-line overlap
const STAGE_HEADER_HEIGHT = 70;
const BRANCH_OFFSET = 320; // Significant offset for parallel decision branches

/**
 * Helper: Get Color Theme based on Responsible Actor
 * Dynamic hashing for infinite unique actor colors with consistent pastel palette
 */
export const getActorTheme = (actor: string) => {
    const normalized = (actor || 'System').trim();
    
    // Robust string hashing
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use full 360 hue spectrum
    const h = Math.abs(hash % 360);
    
    // Generate distinct, readable HSL Palette
    return { 
        bg: `hsl(${h}, 95%, 96%)`,        // Light background
        border: `hsl(${h}, 60%, 80%)`,    // Soft border
        left: `hsl(${h}, 70%, 50%)`,      // Strong accent bar
        text: `hsl(${h}, 80%, 15%)`,      // High contrast text
        iconBg: `hsl(${h}, 80%, 90%)`,    // For UI icons
        iconColor: `hsl(${h}, 80%, 40%)`  // For UI icons
    };
};


/**
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number, layoutType: LayoutType = 'SWIMLANE'): Node => {
    // Default styling
    let theme = getActorTheme(step.actor);
    
    let background = theme.bg;
    let border = `1px solid ${theme.border}`;
    let borderLeft = `6px solid ${theme.left}`;
    let borderRadius = '12px';
    let color = theme.text;
    let width = NODE_WIDTH;
    let height: number | undefined = undefined; // Auto height
    let textAlign: 'left' | 'center' = 'left';

    // Safety check for missing step data
    if (!step) return { id: 'error', position: { x: 0, y: 0 }, data: { label: 'Error' } };

    // --- Special Shape Overrides (Start/End) ---
    if (step.stepType === 'Start') {
        background = '#f0fdf4'; 
        border = '2px solid #22c55e';
        borderLeft = 'none';
        color = '#14532d';
        borderRadius = '50px';
        textAlign = 'center';
    } else if (step.stepType === 'End') {
        background = '#fef2f2'; 
        border = '2px solid #ef4444';
        borderLeft = 'none';
        color = '#7f1d1d';
        borderRadius = '50px';
        textAlign = 'center';
    } else if (step.stepType === 'Decision') {
        borderRadius = '32px';
        border = `2px solid ${theme.border}`;
        textAlign = 'center';
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
            width,
            minHeight: '80px',
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.4',
            // CRITICAL: High Z-Index ensures box is ALWAYS on top of lines
            zIndex: 1001, 
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', 
            textAlign,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: textAlign === 'center' ? 'center' : 'flex-start',
            cursor: 'pointer',
            color: color,
            fontWeight: 500,
            transition: 'all 0.2s ease',
        },
        className: 'hover:scale-105 transition-transform hover:shadow-lg'
    };
};

/**
 * Helper to create edges
 */
const createEdges = (nodes: Node[], data: SopResponse, layoutType: LayoutType): Edge[] => {
    const edges: Edge[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Helper to add edge
    const addEdge = (source: string, target: string, label?: string, defaultColor: string = '#cbd5e1') => {
        if (!source || !target) return;
        if (!nodeMap.has(source) || !nodeMap.has(target)) return;
        
        let strokeDasharray = '0';
        let color = defaultColor;
        let type = 'smoothstep'; // Orthogonal lines preventing diagonal overlap

        edges.push({
            id: `e-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
            source,
            target,
            label: label ? (label.length > 20 ? label.substring(0, 18) + '...' : label) : undefined,
            type, 
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { 
                stroke: color, 
                strokeWidth: 2, 
                strokeDasharray 
            }, 
            pathOptions: { borderRadius: 25 },
            labelStyle: { fill: '#64748b', fontWeight: 700, fontSize: 10 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9, rx: 4, ry: 4 },
            // CRITICAL: Low Z-Index ensures lines are BEHIND boxes
            zIndex: 0, 
        } as any);
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
                                addEdge(step.stepId, branch.nextStep, branch.condition, '#f59e0b');
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

    // Pre-process Decision Offsets for visual branching
    const decisionChildMap = new Map<string, number>();
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach(stage => {
            if(stage.steps) {
                stage.steps.forEach(step => {
                    if (step.stepType === 'Decision' && step.decisionBranches) {
                        const count = step.decisionBranches.length;
                        step.decisionBranches.forEach((branch, idx) => {
                            if(branch.nextStep) {
                                let offsetDir = 0;
                                if (count === 2) offsetDir = idx === 0 ? -1 : 1;
                                else if (count > 2) offsetDir = idx - Math.floor(count / 2);
                                decisionChildMap.set(branch.nextStep, offsetDir);
                            }
                        });
                    }
                });
            }
        });
    }

    // Start Node - Centered in first column
    nodes.push(createNode(data.startNode, (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2, STAGE_HEADER_HEIGHT + 60, 'SWIMLANE'));

    let currentX = 0;
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach((stage, index) => {
            // Stage Background
            nodes.push({
                id: `bg-${stage.stageId}`,
                type: 'default', 
                data: { label: '' },
                position: { x: currentX, y: 0 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 40, 
                    height: 3500, // Very tall to accommodate long flows
                    background: index % 2 === 0 ? '#f8fafc' : '#ffffff', 
                    borderRadius: '32px',
                    border: '1px dashed #e2e8f0',
                    zIndex: -1, 
                    pointerEvents: 'none',
                },
                draggable: false,
                selectable: false,
            });

            // Stage Header - DISTINCT STYLING
            nodes.push({
                id: `stage-${stage.stageId}`,
                type: 'default', 
                data: { label: stage.stageName },
                position: { x: currentX + 40, y: 20 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 120,
                    height: 56,
                    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', // Dark blue-slate gradient
                    borderRadius: '16px',
                    border: '1px solid #475569',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 24px'
                },
                selectable: false,
                draggable: false
            });

            let currentY = STAGE_HEADER_HEIGHT + 220; 
            
            if (stage.steps) {
                stage.steps.forEach(step => {
                    let nodeX = currentX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
                    // Apply branch offset if part of a decision tree
                    if (decisionChildMap.has(step.stepId)) {
                        nodeX += (decisionChildMap.get(step.stepId)! * BRANCH_OFFSET);
                    }
                    nodes.push(createNode(step, nodeX, currentY, 'SWIMLANE'));
                    currentY += NODE_HEIGHT + Y_GAP;
                });
            }
            currentX += SWIMLANE_COL_WIDTH;
        });
    }

    // End Node placement
    let lastY = 400;
    let lastStageX = 0;
    if (data.processFlow?.stages?.length > 0) {
        lastStageX = (data.processFlow.stages.length - 1) * SWIMLANE_COL_WIDTH;
        const lastStage = data.processFlow.stages[data.processFlow.stages.length - 1];
        if (lastStage?.steps) {
            lastY = STAGE_HEADER_HEIGHT + 220 + (lastStage.steps.length * (NODE_HEIGHT + Y_GAP));
        }
    }
    if (data.endNode) {
        const endX = lastStageX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
        nodes.push(createNode(data.endNode, endX, lastY + 80, 'SWIMLANE'));
    }

    return nodes;
};

/**
 * Helper for Tree Levels (Topological Depth)
 */
const buildTreeLevels = (data: SopResponse) => {
    const levels: Record<string, number> = {};
    const stepMap = new Map<string, ProcessStep>();

    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow?.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    if (!data.startNode) return { levels, stepMap };

    const queue: { id: string, level: number }[] = [{ id: data.startNode.stepId, level: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const { id, level } = queue.shift()!;
        if (visited.has(id)) continue;
        visited.add(id);
        
        levels[id] = Math.max(levels[id] || 0, level); // Use Max to push deeper

        const step = stepMap.get(id);
        if (!step) continue;

        const children: string[] = [];
        if (step.nextStep) children.push(step.nextStep);
        if (step.decisionBranches) step.decisionBranches.forEach(b => { if (b.nextStep) children.push(b.nextStep); });
        children.forEach(childId => queue.push({ id: childId, level: level + 1 }));
    }
    return { levels, stepMap };
};

/**
 * Layout 2: Vertical Decision Tree
 */
const getDecisionTreeLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    const stepMap = new Map<string, ProcessStep>();
    
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow?.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    if (!data.startNode) return nodes;

    const visited = new Set<string>();
    const subtreeWidths = new Map<string, number>();

    const calculateWidths = (stepId: string): number => {
        if (visited.has(stepId)) return NODE_WIDTH + X_GAP; 
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return 0;

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        if (childrenIds.length === 0) {
            subtreeWidths.set(stepId, NODE_WIDTH + X_GAP);
            return NODE_WIDTH + X_GAP;
        }

        let width = 0;
        childrenIds.forEach(child => width += calculateWidths(child));
        subtreeWidths.set(stepId, width);
        return width;
    };

    visited.clear();
    calculateWidths(data.startNode.stepId);
    visited.clear();

    const placeNodes = (stepId: string, x: number, y: number) => {
        if (visited.has(stepId)) return; 
        visited.add(stepId);

        const step = stepMap.get(stepId);
        if (!step) return;

        nodes.push(createNode(step, x, y, 'TREE'));

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        let currentX = x - (subtreeWidths.get(stepId)! / 2);
        childrenIds.forEach(childId => {
            const childWidth = subtreeWidths.get(childId) || (NODE_WIDTH + X_GAP);
            const childX = currentX + (childWidth / 2);
            placeNodes(childId, childX, y + NODE_HEIGHT + Y_GAP);
            currentX += childWidth;
        });
    };

    placeNodes(data.startNode.stepId, 0, 0);
    
    if (data.endNode && !visited.has(data.endNode.stepId)) {
         const maxY = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.y)) : 0;
         nodes.push(createNode(data.endNode, 0, maxY + NODE_HEIGHT + Y_GAP, 'TREE'));
    }

    return nodes;
};

/**
 * Layout 3: Horizontal Tree
 */
const getHorizontalTreeLayout = (data: SopResponse): Node[] => {
    const { levels, stepMap } = buildTreeLevels(data);
    const nodes: Node[] = [];
    const nodesByLevel: Record<number, string[]> = {};
    
    Object.entries(levels).forEach(([id, level]) => {
        if (!nodesByLevel[level]) nodesByLevel[level] = [];
        nodesByLevel[level].push(id);
    });

    const maxLevel = Math.max(...Object.values(levels), 0);
    
    for (let l = 0; l <= maxLevel; l++) {
        const levelNodes = nodesByLevel[l] || [];
        const levelHeight = levelNodes.length * (NODE_HEIGHT + 80);
        let startY = -(levelHeight / 2); 

        levelNodes.forEach(nodeId => {
            const step = stepMap.get(nodeId);
            if (step) {
                nodes.push(createNode(step, l * (NODE_WIDTH + 200), startY, 'HORIZONTAL'));
                startY += NODE_HEIGHT + 80;
            }
        });
    }
    return nodes;
};


export const convertSopToFlowData = (data: SopResponse, layoutType: LayoutType = 'SWIMLANE') => {
    let nodes: Node[] = [];

    // Validation
    if (!data || !data.startNode) {
        console.warn("Invalid data passed to layout converter: Missing startNode");
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
