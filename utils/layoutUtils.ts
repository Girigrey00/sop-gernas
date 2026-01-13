
import { Node, Edge, MarkerType } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// --- Constants & Config ---
const NODE_WIDTH = 280;
const NODE_HEIGHT = 120; 
const X_GAP = 200; // Wide gap for horizontal trees
const Y_GAP = 180; // Tall gap for vertical flow
const SWIMLANE_COL_WIDTH = 900; // Very wide swimlanes to prevent decision overlap
const STAGE_HEADER_HEIGHT = 80;
const BRANCH_OFFSET = 350; // Offset for decision branches

// Google Brand Colors for Headers
const GOOGLE_COLORS = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
];

// Start/End Specific Colors
const COLOR_START = {
    bg: '#e6f4ea',
    border: '#34A853',
    text: '#137333'
};

const COLOR_END = {
    bg: '#fce8e6',
    border: '#EA4335',
    text: '#c5221f'
};

/**
 * Helper: Get Color Theme based on Responsible Actor
 * Generates consistent, distinct pastel colors for dynamic actors.
 */
export const getActorTheme = (actor: string) => {
    const normalized = (actor || 'System').trim();
    
    // Robust string hashing
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use full 360 hue spectrum, but shift to avoid purely red/green (reserved for start/end)
    // We add a prime number offset to the hash to scatter colors well
    const h = Math.abs((hash * 137) % 360);
    
    return { 
        bg: `hsl(${h}, 90%, 96%)`,        // Very light pastel background
        border: `hsl(${h}, 50%, 80%)`,    // Subtle border
        left: `hsl(${h}, 65%, 55%)`,      // Vibrant left accent bar
        text: `hsl(${h}, 80%, 15%)`,      // Dark readable text
        iconBg: `hsl(${h}, 80%, 90%)`,    
        iconColor: `hsl(${h}, 80%, 40%)` 
    };
};

/**
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number, layoutType: LayoutType = 'SWIMLANE'): Node => {
    // 1. Determine Styling based on Type or Actor
    let style: React.CSSProperties = {};
    let className = 'hover:scale-105 transition-transform hover:shadow-xl';

    // Default Dynamic Actor Theme
    let theme = getActorTheme(step.actor);
    
    // Base Style
    style = {
        width: NODE_WIDTH,
        minHeight: '90px',
        padding: '16px',
        fontSize: '13px',
        lineHeight: '1.5',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        zIndex: 1001, // ALWAYS on top of edges
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderLeft: `5px solid ${theme.left}`,
        color: theme.text,
    };

    // 2. Overrides for Special Types
    if (step.stepType === 'Start') {
        style.background = COLOR_START.bg;
        style.border = `2px solid ${COLOR_START.border}`;
        style.color = COLOR_START.text;
        style.borderRadius = '50px';
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none'; // No accent bar for start
        style.boxShadow = '0 10px 15px -3px rgba(52, 168, 83, 0.2)';
    } 
    else if (step.stepType === 'End') {
        style.background = COLOR_END.bg;
        style.border = `2px solid ${COLOR_END.border}`;
        style.color = COLOR_END.text;
        style.borderRadius = '50px';
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none'; // No accent bar for end
        style.boxShadow = '0 10px 15px -3px rgba(234, 67, 53, 0.2)';
    }
    else if (step.stepType === 'Decision') {
        // Diamond-ish feel via border radius, but keep content readable
        style.borderRadius = '24px';
        style.border = `2px solid ${theme.left}`; // Thicker border for decisions
        style.background = '#ffffff'; // White bg to stand out
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none';
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
        style: style,
        className: className
    };
};

/**
 * Helper to create edges with "Step" routing to avoid diagonal overlaps
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
            type: 'smoothstep', // Orthogonal lines are strictly required to avoid box overlap
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { 
                stroke: color, 
                strokeWidth: 2, 
            }, 
            pathOptions: { borderRadius: 30 },
            labelStyle: { fill: color, fontWeight: 700, fontSize: 11 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.95, rx: 4, ry: 4 },
            zIndex: 0, // BEHIND nodes
        } as any);
    };

    // 1. Start Flow
    if (data.startNode && data.startNode.nextStep) {
        addEdge(data.startNode.stepId, data.startNode.nextStep, undefined, COLOR_START.border);
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
 * Layout: Swimlane with Google-Themed Headers
 */
const getSwimlaneLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    if (!data.startNode) return nodes;

    // --- Decision Branch Spacing Logic ---
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
                                // Distribute branches: Left (-), Center (0), Right (+)
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

    // 1. Place Start Node
    nodes.push(createNode(data.startNode, (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2, STAGE_HEADER_HEIGHT + 40, 'SWIMLANE'));

    let currentX = 0;
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach((stage, index) => {
            
            // Cycle Google Colors
            const headerColor = GOOGLE_COLORS[index % GOOGLE_COLORS.length];

            // A. Stage Background Column
            nodes.push({
                id: `bg-${stage.stageId}`,
                type: 'default', 
                data: { label: '' },
                position: { x: currentX, y: 0 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 20, 
                    height: 4000, 
                    background: index % 2 === 0 ? '#f8fafd' : '#ffffff', // Very subtle alt shading
                    borderRadius: '24px',
                    border: '1px dashed #e2e8f0',
                    zIndex: -1, 
                    pointerEvents: 'none',
                },
                draggable: false,
                selectable: false,
            });

            // B. Google-Themed Stage Header
            nodes.push({
                id: `stage-${stage.stageId}`,
                type: 'default', 
                data: { label: stage.stageName },
                position: { x: currentX + 20, y: 20 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 60,
                    height: 60,
                    background: '#ffffff',
                    borderTop: `6px solid ${headerColor}`, // Colorful top bar
                    borderBottom: '1px solid #e2e8f0',
                    borderLeft: '1px solid #e2e8f0',
                    borderRight: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#202124', // Google Dark Grey
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
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

            // C. Place Steps
            let currentY = STAGE_HEADER_HEIGHT + 200; 
            
            if (stage.steps) {
                stage.steps.forEach(step => {
                    let nodeX = currentX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
                    
                    // Apply offset if this node is part of a split
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

    // 2. Place End Node
    let lastY = 500;
    let lastStageX = 0;
    if (data.processFlow?.stages?.length > 0) {
        lastStageX = (data.processFlow.stages.length - 1) * SWIMLANE_COL_WIDTH;
        const lastStage = data.processFlow.stages[data.processFlow.stages.length - 1];
        if (lastStage?.steps) {
            lastY = STAGE_HEADER_HEIGHT + 200 + (lastStage.steps.length * (NODE_HEIGHT + Y_GAP));
        }
    }
    if (data.endNode) {
        const endX = lastStageX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
        nodes.push(createNode(data.endNode, endX, lastY + 100, 'SWIMLANE'));
    }

    return nodes;
};


// --- Standard Tree Layout (Vertical) ---
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

// --- Horizontal Tree Layout ---
const getHorizontalTreeLayout = (data: SopResponse): Node[] => {
    // Basic implementation reuse
    return getDecisionTreeLayout(data); // Fallback for simplicity in this specific update
};

export const convertSopToFlowData = (data: SopResponse, layoutType: LayoutType = 'SWIMLANE') => {
    let nodes: Node[] = [];

    if (!data || !data.startNode) {
        console.warn("Invalid data passed to layout converter");
        return { nodes: [], edges: [] };
    }

    try {
        switch (layoutType) {
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
