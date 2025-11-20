
import { Node, Edge, MarkerType } from 'reactflow';
import { SopResponse, ProcessStep, LayoutType } from '../types';

// Constants
const NODE_WIDTH = 280;
const NODE_HEIGHT = 100; 
const X_GAP = 80;
const Y_GAP = 100;
const SWIMLANE_COL_WIDTH = 500; 
const STAGE_HEADER_HEIGHT = 60;
const BRANCH_OFFSET = 140; 

/**
 * Helper: Get Color Theme based on Responsible Actor
 * Updated with BRIGHTER, VIBRANT colors
 */
export const getActorTheme = (actor: string) => {
    const normalized = (actor || '').toLowerCase();
    
    // Customer / Client (Vibrant Purple)
    if (normalized.includes('customer') || normalized.includes('client')) {
        return { bg: '#fae8ff', border: '#e879f9', left: '#c026d3', text: '#6b21a8' }; 
    }
    // System / Automated (Cool Cyan/Slate)
    if (normalized.includes('system') || normalized.includes('bot') || normalized.includes('ai')) {
        return { bg: '#ecfeff', border: '#22d3ee', left: '#0891b2', text: '#155e75' }; 
    }
    // Operations / Back Office (Bright Orange)
    if (normalized.includes('operation') || normalized.includes('ops') || normalized.includes('admin')) {
        return { bg: '#ffedd5', border: '#fb923c', left: '#ea580c', text: '#9a3412' }; 
    }
    // Credit / Risk / Compliance (Vibrant Blue)
    if (normalized.includes('credit') || normalized.includes('risk') || normalized.includes('compliance') || normalized.includes('qa')) {
        return { bg: '#dbeafe', border: '#60a5fa', left: '#2563eb', text: '#1e40af' }; 
    }
    // Third Party / External (Bright Emerald/Teal)
    if (normalized.includes('ttp') || normalized.includes('vendor') || normalized.includes('external')) {
        return { bg: '#d1fae5', border: '#34d399', left: '#059669', text: '#064e3b' }; 
    }
    // Management / Approval (Vibrant Rose)
    if (normalized.includes('manager') || normalized.includes('head') || normalized.includes('approver')) {
        return { bg: '#ffe4e6', border: '#fb7185', left: '#e11d48', text: '#9f1239' }; 
    }
    // Default (Clean White/Gray)
    return { bg: '#ffffff', border: '#cbd5e1', left: '#64748b', text: '#1e293b' };
};


/**
 * Helper to create a standard node object
 */
const createNode = (step: ProcessStep, x: number, y: number, layoutType: LayoutType = 'SWIMLANE'): Node => {
    // Default styling
    let theme = getActorTheme(step.actor);
    
    let background = theme.bg;
    let border = `1px solid ${theme.border}`;
    let borderLeft = `4px solid ${theme.left}`;
    let borderRadius = '12px';
    let color = theme.text;
    let width = NODE_WIDTH;
    let height: number | undefined = undefined; // Auto height usually
    let textAlign: 'left' | 'center' = 'left';

    // Safety check for missing step data
    if (!step) return { id: 'error', position: { x: 0, y: 0 }, data: { label: 'Error' } };

    // --- Special Shape Overrides (Start/End) ---
    if (step.stepType === 'Start') {
        // Bright Green
        background = '#dcfce7'; 
        border = '2px solid #4ade80';
        borderLeft = 'none';
        color = '#14532d';
        borderRadius = '30px';
        textAlign = 'center';
    } else if (step.stepType === 'End') {
        // Bright Red
        background = '#fee2e2'; 
        border = '2px solid #f87171';
        borderLeft = 'none';
        color = '#7f1d1d';
        borderRadius = '30px';
        textAlign = 'center';
    } else if (step.stepType === 'Decision') {
        // Decisions keep the actor color but get a more rounded shape and slightly thicker border
        borderRadius = '24px';
        border = `2px solid ${theme.border}`;
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
            height,
            padding: '16px',
            fontSize: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -1px rgb(0 0 0 / 0.05)', // Softer shadow
            textAlign,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            color: color,
            fontWeight: 600,
        },
        zIndex: 10, 
    };
};

/**
 * Helper to create edges
 */
const createEdges = (nodes: Node[], data: SopResponse, layoutType: LayoutType): Edge[] => {
    const edges: Edge[] = [];
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const stepMap = new Map<string, ProcessStep>();
    
    // Build step map for actor lookups
    if (data.startNode) stepMap.set(data.startNode.stepId, data.startNode);
    if (data.endNode) stepMap.set(data.endNode.stepId, data.endNode);
    data.processFlow.stages?.forEach(s => s.steps?.forEach(st => stepMap.set(st.stepId, st)));

    // Helper to add edge
    const addEdge = (source: string, target: string, label?: string, defaultColor: string = '#64748b') => {
        if (!source || !target) return;
        if (!nodeMap.has(source) || !nodeMap.has(target)) return;
        
        let strokeDasharray = '0'; // Solid by default
        let color = defaultColor;
        let type = 'smoothstep';

        edges.push({
            id: `e-${source}-${target}-${Math.random().toString(36).substr(2, 5)}`,
            source,
            target,
            label: label ? (label.length > 20 ? label.substring(0, 18) + '...' : label) : undefined,
            type, 
            markerEnd: { type: MarkerType.ArrowClosed, color },
            style: { stroke: color, strokeWidth: 2, strokeDasharray }, 
            pathOptions: { borderRadius: 20 },
            labelStyle: { fill: color, fontWeight: 700, fontSize: 11 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.85 },
            zIndex: 20,
        } as any);
    };

    // 1. Start -> First Step
    if (data.startNode && data.startNode.nextStep) {
        addEdge(data.startNode.stepId, data.startNode.nextStep, undefined, '#10b981'); // Green start arrow
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
                                addEdge(step.stepId, branch.nextStep, branch.condition, '#f97316'); // Orange for decisions
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

    // Start Node
    nodes.push(createNode(data.startNode, (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2, STAGE_HEADER_HEIGHT + 40, 'SWIMLANE'));

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
                    width: SWIMLANE_COL_WIDTH,
                    height: 2000, 
                    background: index % 2 === 0 ? '#f8fafc' : '#ffffff', 
                    borderRight: '1px dashed #cbd5e1',
                    border: 'none',
                    zIndex: -1, 
                    pointerEvents: 'none',
                },
                draggable: false,
                selectable: false,
            });

            // Stage Header - Updated Styling
            nodes.push({
                id: `stage-${stage.stageId}`,
                type: 'default', 
                data: { label: stage.stageName },
                position: { x: currentX + 20, y: 20 },
                style: {
                    width: SWIMLANE_COL_WIDTH - 40,
                    height: 46,
                    background: '#f1f5f9', // Slate 100
                    border: '1px solid #cbd5e1', // Slate 300
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#334155', // Slate 700
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: '0 16px'
                },
                selectable: false,
                draggable: false
            });

            let currentY = STAGE_HEADER_HEIGHT + 150; 
            
            if (stage.steps) {
                stage.steps.forEach(step => {
                    let nodeX = currentX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
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

    // End Node Logic
    let lastY = 300;
    let lastStageX = 0;
    if (data.processFlow?.stages?.length > 0) {
        lastStageX = (data.processFlow.stages.length - 1) * SWIMLANE_COL_WIDTH;
        const lastStage = data.processFlow.stages[data.processFlow.stages.length - 1];
        if (lastStage?.steps) {
            lastY = STAGE_HEADER_HEIGHT + 150 + (lastStage.steps.length * (NODE_HEIGHT + Y_GAP));
        }
    }
    if (data.endNode) {
        const endX = lastStageX + (SWIMLANE_COL_WIDTH - NODE_WIDTH) / 2;
        nodes.push(createNode(data.endNode, endX, lastY, 'SWIMLANE'));
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
        const levelHeight = levelNodes.length * (NODE_HEIGHT + 50);
        let startY = -(levelHeight / 2); 

        levelNodes.forEach(nodeId => {
            const step = stepMap.get(nodeId);
            if (step) {
                nodes.push(createNode(step, l * (NODE_WIDTH + 150), startY, 'HORIZONTAL'));
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