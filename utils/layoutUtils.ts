
import { Node, Edge, MarkerType, Position } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// --- Constants & Config ---
const NODE_WIDTH = 280; 
const NODE_HEIGHT = 140; 

// Swimlane Config
const SWIMLANE_COL_WIDTH = 400; // Tighter columns for better readability
const SWIMLANE_Y_GAP = 100;
const SWIMLANE_HEADER_HEIGHT = 80;

// Tree Config
const TREE_X_GAP = 50; 
const TREE_Y_GAP = 150; 
const HORIZ_X_GAP = 300;
const HORIZ_Y_GAP = 50;

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
 */
export const getActorTheme = (actor: string) => {
    const normalized = (actor || 'System').trim();
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
        hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % DISTINCT_ACTOR_PALETTE.length);
    return DISTINCT_ACTOR_PALETTE[index];
};

/**
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number, layoutType: LayoutType): Node => {
    let style: React.CSSProperties = {};
    let className = 'hover:scale-105 transition-transform duration-300'; 

    let theme = getActorTheme(step.actor);
    
    // Base Style
    style = {
        width: NODE_WIDTH,
        minHeight: '110px',
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
        zIndex: 1002,
        background: theme.bg,
        border: `2px solid ${theme.border}`, 
        borderLeft: `6px solid ${theme.left}`, 
        color: theme.text,
    };

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

    // Handle Positions
    let sourcePos = Position.Bottom;
    let targetPos = Position.Top;

    if (layoutType === 'HORIZONTAL') {
        sourcePos = Position.Right;
        targetPos = Position.Left;
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
        className: className,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
    };
};

/**
 * Helper to create edges
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
            type: 'smoothstep', 
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { 
                stroke: color, 
                strokeWidth: 2,
            }, 
            pathOptions: { borderRadius: 40 },
            labelStyle: { fill: '#1e293b', fontWeight: 800, fontSize: 11 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 1, stroke: color, strokeWidth: 1, rx: 6, ry: 6 },
            labelBgPadding: [6, 4],
            zIndex: 1001, 
        } as any);
    };

    // Edge creation logic matches the structure
    if (data.startNode && data.startNode.nextStep) addEdge(data.startNode.stepId, data.startNode.nextStep, undefined, '#10b981');

    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach(stage => {
            if (stage.steps) {
                stage.steps.forEach(step => {
                    if (step.nextStep && (!step.decisionBranches || step.decisionBranches.length === 0)) {
                         addEdge(step.stepId, step.nextStep);
                    }
                    if (step.decisionBranches) {
                        step.decisionBranches.forEach(branch => {
                            if (branch.nextStep) addEdge(step.stepId, branch.nextStep, branch.condition, '#f59e0b');
                        });
                    }
                });
            }
        });
    }

    return edges;
};


// --- 1. Strict Swimlane Layout ---
// Groups nodes strictly by Stage ID. Does not use BFS for positioning, uses array index.
const getSwimlaneLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    if (!data.startNode) return nodes;

    let currentX = 0;

    // 1. Process Stages
    if (data.processFlow && data.processFlow.stages) {
        data.processFlow.stages.forEach((stage, index) => {
            const headerColor = HEADER_COLORS[index % HEADER_COLORS.length];
            const stageLeft = currentX;
            const stageCenter = stageLeft + (SWIMLANE_COL_WIDTH / 2);

            // A. Stage Background
            nodes.push({
                id: `bg-${stage.stageId}`,
                type: 'default', 
                data: { label: '' },
                position: { x: stageLeft, y: 0 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 20, 
                    height: 5000, 
                    background: index % 2 === 0 ? '#f8fafc' : '#ffffff', 
                    borderRadius: '20px',
                    border: '1px dashed #cbd5e1',
                    zIndex: -1, 
                    pointerEvents: 'none',
                },
                draggable: false, selectable: false,
            });

            // B. Header
            nodes.push({
                id: `stage-${stage.stageId}`,
                type: 'default', 
                data: { label: stage.stageName },
                position: { x: stageLeft + 20, y: 20 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 60,
                    height: 60,
                    background: '#ffffff',
                    borderTop: `6px solid ${headerColor}`, 
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#334155', 
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    padding: '0 10px', textTransform: 'uppercase'
                },
                selectable: false, draggable: false
            });

            // C. Place Steps Vertically in this Column
            let currentY = SWIMLANE_HEADER_HEIGHT + 100;
            
            // Check if Start Node belongs here (usually Stage 1, but technically Start Node is separate)
            // We'll place Start Node in the first stage area visually
            if (index === 0 && data.startNode) {
                 nodes.push(createNode(data.startNode, stageCenter - (NODE_WIDTH / 2), currentY, 'SWIMLANE'));
                 currentY += NODE_HEIGHT + SWIMLANE_Y_GAP;
            }

            if (stage.steps) {
                stage.steps.forEach(step => {
                    nodes.push(createNode(step, stageCenter - (NODE_WIDTH / 2), currentY, 'SWIMLANE'));
                    currentY += NODE_HEIGHT + SWIMLANE_Y_GAP;
                });
            }

            // Check if End Node belongs here (Last Stage)
            if (index === data.processFlow.stages.length - 1 && data.endNode) {
                 nodes.push(createNode(data.endNode, stageCenter - (NODE_WIDTH / 2), currentY, 'SWIMLANE'));
            }

            currentX += SWIMLANE_COL_WIDTH;
        });
    }

    return nodes;
};


// --- 2. Vertical Tree Layout (True Hierarchy) ---
const getVerticalTreeLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    const stepMap = new Map<string, ProcessStep>();
    
    // Flatten steps
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow?.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    if (!data.startNode) return nodes;

    const visited = new Set<string>();
    const subtreeWidths = new Map<string, number>();

    // Calculate Widths (Recursive)
    const calculateWidth = (stepId: string): number => {
        if (visited.has(stepId)) return NODE_WIDTH + TREE_X_GAP;
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return NODE_WIDTH + TREE_X_GAP;

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        if (childrenIds.length === 0) {
            subtreeWidths.set(stepId, NODE_WIDTH + TREE_X_GAP);
            return NODE_WIDTH + TREE_X_GAP;
        }

        let totalWidth = 0;
        childrenIds.forEach(child => totalWidth += calculateWidth(child));
        subtreeWidths.set(stepId, totalWidth);
        return totalWidth;
    };

    visited.clear();
    calculateWidth(data.startNode.stepId);
    visited.clear();

    // Place Nodes (Recursive)
    const placeNodes = (stepId: string, x: number, y: number) => {
        if (visited.has(stepId)) return;
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return;

        nodes.push(createNode(step, x, y, 'TREE'));

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        if (childrenIds.length === 0) return;

        // Position Children centered below
        const totalW = subtreeWidths.get(stepId) || 0;
        let startX = x - (totalW / 2);
        
        // Slightly offset first child to avoid direct overlap if simple line
        // Actually, centering logic:
        // Child 1 center is startX + childWidth/2
        
        let currentChildX = x - (totalW / 2); // Start at left edge of this subtree block

        childrenIds.forEach(childId => {
            const w = subtreeWidths.get(childId) || (NODE_WIDTH + TREE_X_GAP);
            const childCenterX = currentChildX + (w / 2);
            
            placeNodes(childId, childCenterX, y + NODE_HEIGHT + TREE_Y_GAP);
            currentChildX += w;
        });
    };

    placeNodes(data.startNode.stepId, 0, 50);
    return nodes;
};


// --- 3. Horizontal Tree Layout ---
const getHorizontalTreeLayout = (data: SopResponse): Node[] => {
    const nodes: Node[] = [];
    const stepMap = new Map<string, ProcessStep>();
    
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow?.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    if (!data.startNode) return nodes;

    const visited = new Set<string>();
    const subtreeHeights = new Map<string, number>();

    const calculateHeight = (stepId: string): number => {
        if (visited.has(stepId)) return NODE_HEIGHT + HORIZ_Y_GAP;
        visited.add(stepId);
        
        const step = stepMap.get(stepId);
        if (!step) return NODE_HEIGHT + HORIZ_Y_GAP;

        let childrenIds: string[] = [];
        if (step.decisionBranches?.length) childrenIds = step.decisionBranches.map(b => b.nextStep).filter(Boolean) as string[];
        else if (step.nextStep) childrenIds = [step.nextStep];

        if (childrenIds.length === 0) {
            subtreeHeights.set(stepId, NODE_HEIGHT + HORIZ_Y_GAP);
            return NODE_HEIGHT + HORIZ_Y_GAP;
        }

        let totalHeight = 0;
        childrenIds.forEach(child => totalHeight += calculateHeight(child));
        subtreeHeights.set(stepId, totalHeight);
        return totalHeight;
    };

    visited.clear();
    calculateHeight(data.startNode.stepId);
    visited.clear();

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

        const totalH = subtreeHeights.get(stepId) || 0;
        let startY = y - (totalH / 2);

        childrenIds.forEach(childId => {
            const h = subtreeHeights.get(childId) || (NODE_HEIGHT + HORIZ_Y_GAP);
            const childCenterY = startY + (h / 2);
            
            placeNodes(childId, x + NODE_WIDTH + HORIZ_X_GAP, childCenterY);
            startY += h;
        });
    };

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
                nodes = getVerticalTreeLayout(data);
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
