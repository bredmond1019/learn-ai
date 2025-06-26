'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface DiagramNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  type?: 'primary' | 'secondary' | 'agent' | 'connector' | 'task' | 'process' | 'result' | 'user' | 'service' | 'start' | 'decision' | 'example' | 'option' | 'feature' | 'tool';
}

interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'dashed' | 'curved';
}

interface DiagramProps {
  title?: string;
  description?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  id?: string;
}

// Initialize mermaid
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    fontSize: 14,
    flowchart: {
      htmlLabels: true,
      curve: 'basis',
      rankSpacing: 100,
      nodeSpacing: 80,
      padding: 30,
      diagramPadding: 30,
      useMaxWidth: true,
    },
    themeVariables: {
      primaryColor: '#3b82f6',
      primaryTextColor: '#fff',
      primaryBorderColor: '#2563eb',
      lineColor: '#6b7280',
      secondaryColor: '#e5e7eb',
      tertiaryColor: '#f3f4f6',
      background: '#ffffff',
      mainBkg: '#f9fafb',
      secondBkg: '#e5e7eb',
      tertiaryBkg: '#d1d5db',
      textColor: '#111827',
      taskBkgColor: '#dbeafe',
      taskBorderColor: '#93c5fd',
      taskTextColor: '#1e40af',
      activeTaskBorderColor: '#2563eb',
      activeTaskBkgColor: '#93c5fd',
      gridColor: '#e5e7eb',
      doneTaskBkgColor: '#86efac',
      doneTaskBorderColor: '#4ade80',
      critBorderColor: '#ef4444',
      critBkgColor: '#fee2e2',
      todayLineColor: '#ef4444',
      fontSize: '16px',
    },
  });
}

export function Diagram({ title, description, nodes, edges, id }: DiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const graphId = id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    if (elementRef.current && typeof window !== 'undefined') {
      // Convert our diagram format to Mermaid syntax
      const mermaidCode = generateMermaidCode(nodes, edges);
      
      elementRef.current.innerHTML = `
        <style>
          #${graphId} {
            width: 100%;
            height: auto;
            display: flex;
            justify-content: center;
          }
          #${graphId} svg {
            width: 100%;
            height: auto;
            max-width: none;
          }
          #${graphId} .node rect,
          #${graphId} .node circle,
          #${graphId} .node ellipse,
          #${graphId} .node polygon {
            stroke-width: 2.5px !important;
          }
          #${graphId} .node .label {
            font-size: 14px !important;
            font-weight: 600 !important;
            line-height: 1.3 !important;
            padding: 8px !important;
          }
          #${graphId} .nodeLabel {
            font-size: 14px !important;
          }
          #${graphId} .edgeLabel {
            font-size: 12px !important;
            font-weight: 500 !important;
            background-color: white !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
          }
          #${graphId} .flowchart-link {
            stroke-width: 2px !important;
          }
          @media (max-width: 768px) {
            #${graphId} .node .label {
              font-size: 12px !important;
            }
            #${graphId} .edgeLabel {
              font-size: 10px !important;
            }
          }
        </style>
        <div class="mermaid" id="${graphId}">
          ${mermaidCode}
        </div>
      `;
      
      // Re-render the diagram
      mermaid.init(undefined, elementRef.current.querySelector('.mermaid'));
    }
  }, [nodes, edges, graphId]);

  const generateMermaidCode = (nodes: DiagramNode[], edges: DiagramEdge[]): string => {
    // Simpler layout logic for simplified diagrams
    const nodeCount = nodes.length;
    
    // Use TB (top-bottom) for most diagrams, LR for horizontal workflows
    let code = nodeCount <= 8 ? 'graph TB\n' : 'graph LR\n';
    
    // Add nodes with styling based on type
    nodes.forEach(node => {
      const label = node.label.replace(/"/g, "'");
      // Simple label wrapping for readability
      let wrappedLabel = label;
      if (label.length > 20) {
        const words = label.split(' ');
        if (words.length > 2) {
          const mid = Math.ceil(words.length / 2);
          wrappedLabel = words.slice(0, mid).join(' ') + '<br/>' + words.slice(mid).join(' ');
        }
      }
      code += `    ${node.id}["${wrappedLabel}"]\n`;
    });
    
    code += '\n';
    
    // Add edges
    edges.forEach(edge => {
      const arrow = edge.style === 'dashed' ? '-..->' : '-->';
      if (edge.label) {
        const wrappedEdgeLabel = edge.label.length > 10 ? edge.label.replace(/\s+/g, '<br/>') : edge.label;
        code += `    ${edge.from} ${arrow}|"${wrappedEdgeLabel.replace(/"/g, "'")}"| ${edge.to}\n`;
      } else {
        code += `    ${edge.from} ${arrow} ${edge.to}\n`;
      }
    });
    
    // Add styling classes
    code += '\n';
    code += '    classDef primary fill:#3b82f6,stroke:#2563eb,color:#fff,stroke-width:3px;\n';
    code += '    classDef secondary fill:#e5e7eb,stroke:#9ca3af,color:#374151,stroke-width:2px;\n';
    code += '    classDef agent fill:#fbbf24,stroke:#f59e0b,color:#7c2d12,stroke-width:2px;\n';
    code += '    classDef connector fill:#8b5cf6,stroke:#7c3aed,color:#fff,stroke-width:2px;\n';
    code += '    classDef task fill:#10b981,stroke:#059669,color:#fff,stroke-width:2px;\n';
    code += '    classDef process fill:#06b6d4,stroke:#0891b2,color:#fff,stroke-width:2px;\n';
    code += '    classDef result fill:#22c55e,stroke:#16a34a,color:#fff,stroke-width:2px;\n';
    code += '    classDef user fill:#f59e0b,stroke:#d97706,color:#fff,stroke-width:2px;\n';
    code += '    classDef service fill:#6366f1,stroke:#4f46e5,color:#fff,stroke-width:2px;\n';
    code += '    classDef start fill:#14b8a6,stroke:#0d9488,color:#fff,stroke-width:2px;\n';
    code += '    classDef decision fill:#f43f5e,stroke:#e11d48,color:#fff,stroke-width:2px;\n';
    code += '    classDef example fill:#a78bfa,stroke:#8b5cf6,color:#fff,stroke-width:2px;\n';
    code += '    classDef option fill:#fb923c,stroke:#f97316,color:#fff,stroke-width:2px;\n';
    code += '    classDef feature fill:#38bdf8,stroke:#0ea5e9,color:#fff,stroke-width:2px;\n';
    code += '    classDef tool fill:#facc15,stroke:#eab308,color:#713f12,stroke-width:2px;\n';
    code += '    classDef default fill:#f3f4f6,stroke:#d1d5db,color:#374151,stroke-width:2px;\n';
    
    // Apply classes to nodes
    const nodesByType: { [key: string]: string[] } = {};
    nodes.forEach(node => {
      const type = node.type || 'default';
      if (!nodesByType[type]) nodesByType[type] = [];
      nodesByType[type].push(node.id);
    });
    
    Object.entries(nodesByType).forEach(([type, nodeIds]) => {
      if (nodeIds.length > 0) {
        code += `    class ${nodeIds.join(',')} ${type};\n`;
      }
    });
    
    return code;
  };

  const getNodeStyle = (type?: string): string => {
    // Return empty string - we'll handle styling through classDef
    return '';
  };

  return (
    <div className="my-8">
      {title && (
        <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 overflow-x-auto">
        <div 
          ref={elementRef} 
          className="w-full" 
          style={{ minHeight: '400px', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}