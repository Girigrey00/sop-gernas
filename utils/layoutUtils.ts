
import { Node, Edge, MarkerType, Position } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// --- Constants & Config ---
const NODE_WIDTH = 280; 
const NODE_HEIGHT = 130; 
const X_GAP = 200; 
const Y_GAP = 220; // Large vertical gap to allow lines to route AROUND nodes
const SWIMLANE_COL_WIDTH = 1200; // Extra wide swimlanes to prevent cross-lane overlaps
const STAGE_HEADER_HEIGHT = 100;
const BRANCH_OFFSET = 420; // Wide offset for parallel decision branches to ensure separation

// Horizontal Specific Config
const HORIZ_X_GAP = 350; // Distance between columns in horizontal view
const HORIZ_Y_GAP = 180; // Distance between siblings in horizontal view

// Google Brand Colors for Headers (Cyclical)
const HEADER_COLORS = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#AA00FF', // Purple
    '#FF6D00', // Orange
];

// Start/End Specific Colors
const COLOR_START = {
    bg: '#ecfdf5', // Minty Green
    border: '#10b981',
    text: '#064e3b',
    shadow: '0 8px 20px -4px rgba(16, 185, 129, 0.3)'
};

const COLOR_END = {
    bg: '#fef2f2', // Soft Red
    border: '#ef4444',
    text: '#7f1d1d',
    shadow: '0 8px 20px -4px rgba(239, 68, 68, 0.3)'
};

// --- DISTINCT ACTOR PALETTE ---
// High contrast, vibrant, non-clashing colors. No adjacent yellows.
const DISTINCT_ACTOR_PALETTE = [
    { bg: '#E0F2F1', border: '#00897B', left: '#00695C', text: '#004D40' }, // Teal
    { bg: '#F3E5F5', border: '#8E24AA', left: '#7B1FA2', text: '#4A148C' }, // Purple
    { bg: '#FFF3E0', border: '#FB8C00', left: '#EF6C00', text: '#E65100' }, // Orange
    { bg: '#E3F2FD', border: '#1E88E5', left: '#1565C0', text: '#0D47A1' }, // Blue
    { bg: '#FCE4EC', border: '#D81B60', left: '#C2185B', text: '#880E4F' }, // Pink
    { bg: '#F9FBE7', border: '#C0CA33', left: '#9E9D24', text: '#827717' }, // Lime Green
    { bg: '#ECEFF1', border: '#546E7A', left: '#455A64', text: '#263238' }, // Blue Grey
    { bg: '#E8EAF6', border: '#3949AB', left: '#303F9F', text: '#1A237E' }, // Indigo
];

/**
 * Helper: Get Color Theme based on Responsible Actor
 * Uses a robust hash to pick from the distinct palette cyclically.
 */
export const getActorTheme = (actor: string) => {
    const normalized = (actor || 'System').trim();
    
    // Robust string hashing
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Cycle through the fixed palette
    const index = Math.abs(hash % DISTINCT_ACTOR_PALETTE.length);
    return DISTINCT_ACTOR_PALETTE[index];
};

/**
 * Helper: Calculate X-Offsets for Branching (Vertical Layouts)
 * Traverses the graph to assign horizontal lanes to nodes to avoid overlap.
 */
const calculateGraphOffsets = (data: SopResponse): Map<string, number> => {
    const offsets = new Map<string, number>();
    if (!data.startNode) return offsets;

    const stepMap = new Map<string, ProcessStep>();
    if(data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if(data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow?.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    // Queue for BFS: { id, offset, depth }
    const queue: { id: string, offset: number }[] = [{ id: data.startNode.stepId, offset: 0 }];
    const visited = new Set<string>();

    while(queue.length > 0) {
        const { id, offset } = queue.shift()!;
        
        if (visited.has(id)) continue;
        visited.add(id);
        
        offsets.set(id, offset);

        const step = stepMap.get(id);
        if (!step) continue;

        // 1. Handle Decisions (Split)
        if (step.decisionBranches && step.decisionBranches.length > 0) {
            const branches = step.decisionBranches;
            const count = branches.length;
            
            branches.forEach((branch, idx) => {
                if (!branch.nextStep) return;
                
                // Calculate directional shift
                let shift = 0;
                if (count === 2) {
                    shift = idx === 0 ? -0.8 : 0.8;
                } else {
                    shift = (idx - Math.floor(count / 2)) * 1.0;
                }
                
                // Propagate offset
                const nextOffset = offset + shift;
                queue.push({ id: branch.nextStep, offset: nextOffset });
            });
        } 
        // 2. Handle Linear Flow (Inherit)
        else if (step.nextStep) {
            queue.push({ id: step.nextStep, offset: offset });
        }
    }
    
    return offsets;
};

/**
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number, layoutType: LayoutType = 'SWIMLANE'): Node => {
    // 1. Determine Styling based on Type or Actor
    let style: React.CSSProperties = {};
    let className = 'hover:scale-105 transition-transform duration-300'; 

    // Default Dynamic Actor Theme
    let theme = getActorTheme(step.actor);
    
    // Base Style
    style = {
        width: NODE_WIDTH,
        minHeight: '100px',
        padding: '16px',
        fontSize: '13px',
        lineHeight: '1.5',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: '0 8px 16px -4px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)',
        zIndex: 1002, // Topmost layer to sit above lines
        background: theme.bg,
        border: `2px solid ${theme.border}`, 
        borderLeft: `6px solid ${theme.left}`, 
        color: theme.text,
    };

    // 2. Overrides for Special Types
    if (step.stepType === 'Start') {
        style.background = COLOR_START.bg;
        style.border = `3px solid ${COLOR_START.border}`;
        style.color = COLOR_START.text;
        style.borderRadius = '50px';
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none'; 
        style.boxShadow = COLOR_START.shadow;
    } 
    else if (step.stepType === 'End') {
        style.background = COLOR_END.bg;
        style.border = `3px solid ${COLOR_END.border}`;
        style.color = COLOR_END.text;
        style.borderRadius = '50px';
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none'; 
        style.boxShadow = COLOR_END.shadow;
    }
    else if (step.stepType === 'Decision') {
        style.borderRadius = '24px';
        style.border = `3px solid ${theme.left}`; 
        style.background = '#ffffff'; 
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none';
        style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.12)'; 
        className += ' decision-node';
    }

    // 3. Determine Handles Position based on Layout
    // HORIZONTAL: Left -> Right
    // OTHERS: Top -> Bottom
    const isHorizontal = layoutType === 'HORIZONTAL';

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
        style: style,
        className: className,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
    };
};

/**
 * Helper to create edges with perfect bends
 */
const createEdges = (nodes: Node[], data: SopResponse, layoutType: LayoutType): Edge[] => {
    const edges: Edge[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    const addEdge = (source: string, target: string, label?: string, color: string = '#94a3b8') => {
        if (!source || !target) return;
        if (!nodeMap.has(source) || !nodeMap.has(target)) return;
        
        edges.push({
            id: `e-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
            source,
            target,
            label: label ? (label.length > 25 ? label.substring(0, 22) + '...' : label) : undefined,
            type: 'smoothstep', // Key for orthogonal lines
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { 
                stroke: color, 
                strokeWidth: 2,
            }, 
            pathOptions: { borderRadius: 50 }, // Smooth corners
            labelStyle: { fill: '#1e293b', fontWeight: 800, fontSize: 11 },
            labelBgStyle: { 
                fill: '#ffffff', 
                fillOpacity: 1, 
                stroke: color,
                strokeWidth: 1,
                rx: 6, 
                ry: 6,
            },
            labelBgPadding: [6, 4],
            zIndex: 1001, 
        } as any);
    };

    // 1. Start Flow
    if (data.startNode && data.startNode.nextStep) {
        addEdge(data.startNode.stepId, data.startNode.nextStep, undefined, '#10b981');
    }

    // 2. Process Flow
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach(stage => {
            if (stage.steps) {
                stage.steps.forEach(step => {
                    // Linear
                    if (step.nextStep) {
                        if (step.stepType !== 'Decision' || !step.decisionBranches?.length) {
                            addEdge(step.stepId, step.nextStep);
                        }
                    }
                    // Decisions
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
 * Layout: Swimlane with Google-Themed Headers & Smart Graph Offsets
 */
const getSwimlaneLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    if (!data.startNode) return nodes;

    // 1. Pre-calculate X-offsets for the entire graph to avoid overlaps
    const graphOffsets = calculateGraphOffsets(data);

    // 2. Place Start Node
    nodes.push(createNode(data.startNode, (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2, STAGE_HEADER_HEIGHT + 40, 'SWIMLANE'));

    let currentX = 0;
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach((stage, index) => {
            
            // Cycle Google Colors
            const headerColor = HEADER_COLORS[index % HEADER_COLORS.length];

            // A. Stage Background Column
            nodes.push({
                id: `bg-${stage.stageId}`,
                type: 'default', 
                data: { label: '' },
                position: { x: currentX, y: 0 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 40, 
                    height: 6000, // Very tall canvas
                    background: index % 2 === 0 ? '#f8fafc' : '#ffffff', 
                    borderRadius: '40px',
                    border: '1px dashed #e2e8f0',
                    zIndex: -1, 
                    pointerEvents: 'none',
                },
                draggable: false,
                selectable: false,
            });

            // B. Google-Themed Stage Header with Shadow
            nodes.push({
                id: `stage-${stage.stageId}`,
                type: 'default', 
                data: { label: stage.stageName },
                position: { x: currentX + 40, y: 20 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 120,
                    height: 70,
                    background: '#ffffff',
                    borderTop: `6px solid ${headerColor}`, 
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#1e293b', 
                    fontFamily: 'system-ui, sans-serif',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 32px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                },
                selectable: false,
                draggable: false
            });

            // C. Place Steps
            let currentY = STAGE_HEADER_HEIGHT + 240; 
            
            if (stage.steps) {
                stage.steps.forEach(step => {
                    let nodeX = currentX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
                    
                    // Apply graph-based smart offset
                    if (graphOffsets.has(step.stepId)) {
                        const offsetMultiplier = graphOffsets.get(step.stepId)!;
                        // Branch Offset pushes nodes left/right from center
                        nodeX += (offsetMultiplier * BRANCH_OFFSET);
                    }
                    
                    nodes.push(createNode(step, nodeX, currentY, 'SWIMLANE'));
                    
                    // Increment Y gap
                    currentY += NODE_HEIGHT + Y_GAP;
                });
            }
            currentX += SWIMLANE_COL_WIDTH;
        });
    }

    // 3. Place End Node
    let lastY = 600;
    let lastStageX = 0;
    if (data.processFlow?.stages?.length > 0) {
        lastStageX = (data.processFlow.stages.length - 1) * SWIMLANE_COL_WIDTH;
        const lastStage = data.processFlow.stages[data.processFlow.stages.length - 1];
        if (lastStage?.steps) {
            lastY = STAGE_HEADER_HEIGHT + 240 + (lastStage.steps.length * (NODE_HEIGHT + Y_GAP));
        }
    }
    if (data.endNode) {
        const endX = lastStageX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
        nodes.push(createNode(data.endNode, endX, lastY + 150, 'SWIMLANE'));
    }

    return nodes;
};


// --- Standard Tree Layout (Vertical) ---
const getDecisionTreeLayout = (data: SopResponse): Node[] => {
    return getSwimlaneLayout(data); // Using Swimlane logic as the default vertical view
};

// --- Horizontal Tree Layout ---
const getHorizontalTreeLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    const stepMap = new Map<string, ProcessStep>();
    
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow?.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    if (!data.startNode) return nodes;

    const visited = new Set<string>();
    const subtreeHeights = new Map<string, number>();

    // 1. Calculate Subtree Heights (Vertical Span needed for each node)
    const calculateHeight = (stepId: string): number => {
        if (visited.has(stepId)) return NODE_HEIGHT + HORIZ_Y_GAP; 
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return NODE_HEIGHT + HORIZ_Y_GAP;

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        if (childrenIds.length === 0) {
            const h = NODE_HEIGHT + HORIZ_Y_GAP;
            subtreeHeights.set(stepId, h);
            return h;
        }

        let totalHeight = 0;
        childrenIds.forEach(child => totalHeight += calculateHeight(child));
        subtreeHeights.set(stepId, totalHeight);
        return totalHeight;
    };

    visited.clear();
    calculateHeight(data.startNode.stepId);
    visited.clear();

    // 2. Place Nodes Recursively
    const placeNodes = (stepId: string, x: number, y: number) => {
        if (visited.has(stepId)) return;
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return;

        nodes.push(createNode(step, x, y, 'HORIZONTAL'));

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        if (childrenIds.length === 0) return;

        const totalHeight = subtreeHeights.get(stepId) || 0;
        // Start Y is the top of the block minus half height to center it
        let startY = y - (totalHeight / 2);

        childrenIds.forEach(childId => {
            const childHeight = subtreeHeights.get(childId) || (NODE_HEIGHT + HORIZ_Y_GAP);
            // Center the child in its allocated vertical slice
            const childY = startY + (childHeight / 2);
            
            placeNodes(childId, x + NODE_WIDTH + HORIZ_X_GAP, childY);
            startY += childHeight;
        });
    };

    // Center Start Node vertically at 0
    placeNodes(data.startNode.stepId, 0, 0);

    return nodes;
};

export const convertSopToFlowData = (data: SopResponse, layoutType: LayoutType = 'SWIMLANE') => {
    let nodes: Node[] = [];

    if (!data || !data.startNode) {
        console.warn("Invalid data passed to layout converter");
        return { nodes: [], edges: [] };
    }

    try {
        switch (layoutType) {
            case 'HORIZONTAL':
                nodes = getHorizontalTreeLayout(data);
                break;
            case 'TREE':
                nodes = getDecisionTreeLayout(data);
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
