
import { Node, Edge, MarkerType } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// --- Constants & Config ---
const NODE_WIDTH = 300; // Wider nodes for better text wrapping
const NODE_HEIGHT = 140; 
const X_GAP = 250; 
const Y_GAP = 220; // Large vertical gap to allow lines to route AROUND nodes
const SWIMLANE_COL_WIDTH = 1000; // Very wide swimlanes to prevent cross-lane overlaps
const STAGE_HEADER_HEIGHT = 90;
const BRANCH_OFFSET = 400; // Significant offset for parallel decision branches

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
    bg: '#e6f4ea',
    border: '#34A853',
    text: '#137333',
    shadow: '0 4px 15px rgba(52, 168, 83, 0.4)'
};

const COLOR_END = {
    bg: '#fce8e6',
    border: '#EA4335',
    text: '#c5221f',
    shadow: '0 4px 15px rgba(234, 67, 53, 0.4)'
};

// --- DISTINCT ACTOR PALETTE ---
// Hand-picked vibrant colors to ensure maximum separation.
// Order: Blue -> Orange -> Purple -> Teal -> Pink -> Amber -> Indigo -> Cyan -> DeepOrange -> Lime
const DISTINCT_ACTOR_PALETTE = [
    { bg: '#E3F2FD', border: '#2196F3', left: '#1565C0', text: '#0D47A1' }, // Blue
    { bg: '#FFF3E0', border: '#FF9800', left: '#EF6C00', text: '#E65100' }, // Orange
    { bg: '#F3E5F5', border: '#9C27B0', left: '#7B1FA2', text: '#4A148C' }, // Purple
    { bg: '#E0F2F1', border: '#009688', left: '#00695C', text: '#004D40' }, // Teal
    { bg: '#FCE4EC', border: '#E91E63', left: '#C2185B', text: '#880E4F' }, // Pink
    { bg: '#FFF8E1', border: '#FFC107', left: '#FFA000', text: '#FF6F00' }, // Amber
    { bg: '#E8EAF6', border: '#3F51B5', left: '#283593', text: '#1A237E' }, // Indigo
    { bg: '#E0F7FA', border: '#00BCD4', left: '#00838F', text: '#006064' }, // Cyan
    { bg: '#FBE9E7', border: '#FF5722', left: '#D84315', text: '#BF360C' }, // Deep Orange
    { bg: '#F9FBE7', border: '#CDDC39', left: '#9E9D24', text: '#827717' }, // Lime
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
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number, layoutType: LayoutType = 'SWIMLANE'): Node => {
    // 1. Determine Styling based on Type or Actor
    let style: React.CSSProperties = {};
    let className = 'hover:scale-110 transition-transform duration-300'; // Enhanced hover effect

    // Default Dynamic Actor Theme
    let theme = getActorTheme(step.actor);
    
    // Base Style
    style = {
        width: NODE_WIDTH,
        minHeight: '110px',
        padding: '20px',
        fontSize: '14px',
        lineHeight: '1.5',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: '0 10px 20px -5px rgba(0,0,0,0.1), 0 5px 10px -5px rgba(0,0,0,0.05)', // Soft shadow
        zIndex: 1002, // Topmost layer to sit above lines
        background: theme.bg,
        border: `2px solid ${theme.border}`, // Thicker border
        borderLeft: `8px solid ${theme.left}`, // Prominent accent bar
        color: theme.text,
    };

    // 2. Overrides for Special Types
    if (step.stepType === 'Start') {
        style.background = COLOR_START.bg;
        style.border = `3px solid ${COLOR_START.border}`;
        style.color = COLOR_START.text;
        style.borderRadius = '60px';
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none'; 
        style.boxShadow = COLOR_START.shadow;
    } 
    else if (step.stepType === 'End') {
        style.background = COLOR_END.bg;
        style.border = `3px solid ${COLOR_END.border}`;
        style.color = COLOR_END.text;
        style.borderRadius = '60px';
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none'; 
        style.boxShadow = COLOR_END.shadow;
    }
    else if (step.stepType === 'Decision') {
        // Diamond-ish via CSS not fully possible on div without rotate, 
        // keeping rounded box but distinct styling
        style.borderRadius = '30px';
        style.border = `3px solid ${theme.left}`; 
        style.background = '#ffffff'; 
        style.textAlign = 'center';
        style.alignItems = 'center';
        style.borderLeft = 'none';
        style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.15)'; // Float effect
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
    
    const addEdge = (source: string, target: string, label?: string, color: string = '#64748b') => {
        if (!source || !target) return;
        if (!nodeMap.has(source) || !nodeMap.has(target)) return;
        
        edges.push({
            id: `e-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
            source,
            target,
            label: label ? (label.length > 30 ? label.substring(0, 27) + '...' : label) : undefined,
            type: 'smoothstep', // Orthogonal routing
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { 
                stroke: color, 
                strokeWidth: 2,
            }, 
            pathOptions: { borderRadius: 40 }, // Smooth corners
            // Style the decision label box so it doesn't get lost
            labelStyle: { fill: '#1e293b', fontWeight: 800, fontSize: 12 },
            labelBgStyle: { 
                fill: '#ffffff', 
                fillOpacity: 1, 
                stroke: color,
                strokeWidth: 1,
                rx: 6, 
                ry: 6,
            },
            labelBgPadding: [8, 4],
            zIndex: 1001, // High z-index for the EDGE LABEL mostly, but line is effectively drawn on canvas layer
        } as any);
    };

    // 1. Start Flow
    if (data.startNode && data.startNode.nextStep) {
        addEdge(data.startNode.stepId, data.startNode.nextStep, undefined, '#34A853');
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
            const headerColor = HEADER_COLORS[index % HEADER_COLORS.length];

            // A. Stage Background Column
            nodes.push({
                id: `bg-${stage.stageId}`,
                type: 'default', 
                data: { label: '' },
                position: { x: currentX, y: 0 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 40, 
                    height: 5000, // Very tall
                    background: index % 2 === 0 ? '#fcfcfc' : '#ffffff', 
                    borderRadius: '40px',
                    border: '1px dashed #e2e8f0',
                    zIndex: -1, // Strictly behind everything
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
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#1f2937', 
                    fontFamily: '"Google Sans", Roboto, Arial, sans-serif',
                    // Strong Shadow Effect
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 32px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                },
                selectable: false,
                draggable: false
            });

            // C. Place Steps
            let currentY = STAGE_HEADER_HEIGHT + 240; 
            
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
        nodes.push(createNode(data.endNode, endX, lastY + 120, 'SWIMLANE'));
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
