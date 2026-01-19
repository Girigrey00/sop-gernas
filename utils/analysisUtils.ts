
import { Node, Edge, MarkerType } from 'reactflow';
import { SopResponse } from '../types';

export const convertSopToAnalysisData = (data: SopResponse) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    if (!data || !data.processFlow || !data.processFlow.stages) {
        return { nodes: [], edges: [] };
    }

    const X_GAP = 350; // Horizontal gap between stages
    const Y_START = 0;
    const Y_GAP = 100; // Vertical gap between nodes

    data.processFlow.stages.forEach((stage, index) => {
        const xPos = index * X_GAP;
        const stagePrefix = `l2-${index + 1}`;

        // 1. Process Node (Top) - L2 Process Name
        nodes.push({
            id: stagePrefix,
            data: { label: `${index + 1}. ${stage.stageName}` },
            position: { x: xPos, y: Y_START },
            type: 'default', // Using default type but with custom class
            className: 'process-node',
        });

        // 2. Data Node - Aggregated Inputs
        // Logic: Find steps that imply data collection or "Input" type
        let dataLabels: string[] = [];
        stage.steps.forEach(s => {
            const desc = s.description.toLowerCase();
            const type = s.stepType.toLowerCase();
            if (type.includes('input') || type.includes('capture') || desc.includes('details') || desc.includes('document')) {
                // Heuristic: Extract useful nouns or use step name if short
                if (s.stepName.length < 40) dataLabels.push(s.stepName);
            }
        });
        // Fallback if no specific input steps found
        if (dataLabels.length === 0) dataLabels.push("Standard Stage Data");
        // Dedup and limit
        const uniqueData = Array.from(new Set(dataLabels)).slice(0, 3).join(', ');

        nodes.push({
            id: `data-${index + 1}`,
            data: { label: uniqueData || "Data Inputs" },
            position: { x: xPos, y: Y_START + Y_GAP },
            className: 'data-node',
        });

        // 3. Risk Node
        let risks: string[] = [];
        let riskIds: string[] = [];
        stage.steps.forEach(s => {
            if (s.risksMitigated) {
                s.risksMitigated.forEach(rId => {
                    riskIds.push(rId);
                    const riskDef = data.inherentRisks.find(ir => ir.riskId === rId);
                    if (riskDef) risks.push(riskDef.category); 
                });
            }
        });
        const uniqueRiskIds = Array.from(new Set(riskIds)).join(', ');
        const uniqueRiskCats = Array.from(new Set(risks)).slice(0, 2).join(' / ');
        const riskLabel = uniqueRiskIds ? `${uniqueRiskCats} Risk (${uniqueRiskIds})` : "Operational Risk";

        nodes.push({
            id: `risk-${index + 1}`,
            data: { label: riskLabel },
            position: { x: xPos, y: Y_START + (Y_GAP * 2) },
            className: 'risk-node',
        });

        // 4. Control Node
        let controls: string[] = [];
        stage.steps.forEach(s => {
            if (s.controls) {
                s.controls.forEach(c => controls.push(c.name));
            }
        });
        const uniqueControls = Array.from(new Set(controls)).slice(0, 3).join(', ');

        nodes.push({
            id: `control-${index + 1}`,
            data: { label: uniqueControls || "Standard Process Controls" },
            position: { x: xPos, y: Y_START + (Y_GAP * 3) },
            className: 'control-node',
        });

        // --- Edges within the column ---
        edges.push({
            id: `e-${stagePrefix}-data`,
            source: stagePrefix,
            target: `data-${index + 1}`,
            animated: true,
            type: 'step',
            style: { stroke: '#94a3b8' }
        });
        edges.push({
            id: `e-data-risk-${index + 1}`,
            source: `data-${index + 1}`,
            target: `risk-${index + 1}`,
            type: 'step',
            style: { stroke: '#94a3b8' }
        });
        edges.push({
            id: `e-risk-control-${index + 1}`,
            source: `risk-${index + 1}`,
            target: `control-${index + 1}`,
            type: 'step',
            style: { stroke: '#94a3b8' }
        });

        // --- Edge to next column (Process Sequence) ---
        if (index < data.processFlow.stages.length - 1) {
            edges.push({
                id: `p-${index + 1}-${index + 2}`,
                source: stagePrefix,
                target: `l2-${index + 2}`,
                label: 'next step',
                type: 'step',
                markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
                style: { stroke: '#3b82f6', strokeWidth: 2 }
            });
        }
    });

    return { nodes, edges };
};
