'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, Person, TIER_COLORS } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with canvas
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type GraphNode = {
  id: string;
  name: string;
  tier: string;
  company?: string;
  val: number;
};

type GraphLink = {
  source: string;
  target: string;
  type: string;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

const TIER_HEX: Record<string, string> = {
  stranger: '#6b7280',
  acquaintance: '#9ca3af',
  contact: '#3b82f6',
  colleague: '#22c55e',
  friend: '#06b6d4',
  close_friend: '#8b5cf6',
  inner_circle: '#ec4899',
};

export default function NetworkGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const fgRef = useRef<any>();

  useEffect(() => {
    loadGraph();
  }, []);

  async function loadGraph() {
    // Load persons
    const { data: persons } = await supabase
      .from('persons')
      .select('id, full_name, warmth_tier, current_company')
      .is('archived_at', null);

    // Load relationships
    const { data: relationships } = await supabase
      .from('relationships')
      .select('from_person_id, to_person_id, relationship_type');

    if (!persons) return;

    // Create nodes
    const nodes: GraphNode[] = persons.map(p => ({
      id: p.id,
      name: p.full_name,
      tier: p.warmth_tier,
      company: p.current_company,
      val: tierToSize(p.warmth_tier),
    }));

    // Create links from relationships
    const links: GraphLink[] = (relationships || []).map(r => ({
      source: r.from_person_id,
      target: r.to_person_id,
      type: r.relationship_type,
    }));

    // Also create implicit links for same company
    const byCompany = new Map<string, string[]>();
    persons.forEach(p => {
      if (p.current_company) {
        const existing = byCompany.get(p.current_company) || [];
        existing.push(p.id);
        byCompany.set(p.current_company, existing);
      }
    });

    byCompany.forEach((ids) => {
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          links.push({
            source: ids[i],
            target: ids[j],
            type: 'same_company',
          });
        }
      }
    });

    setGraphData({ nodes, links });
  }

  function tierToSize(tier: string): number {
    const sizes: Record<string, number> = {
      inner_circle: 20,
      close_friend: 15,
      friend: 12,
      colleague: 10,
      contact: 8,
      acquaintance: 6,
      stranger: 4,
    };
    return sizes[tier] || 8;
  }

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 500);
      fgRef.current.zoom(2, 500);
    }
  }, []);

  return (
    <div className="relative h-[calc(100vh-120px)]">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeColor={(node: any) => TIER_HEX[node.tier] || '#6b7280'}
        nodeRelSize={4}
        nodeVal={(node: any) => node.val}
        nodeLabel={(node: any) => `${node.name}${node.company ? ` (${node.company})` : ''}`}
        linkColor={() => '#333'}
        linkWidth={1}
        linkDirectionalParticles={0}
        onNodeClick={handleNodeClick}
        backgroundColor="#0a0a0a"
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name.split(' ')[0];
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = TIER_HEX[node.tier] || '#6b7280';
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.fillText(label, node.x, node.y + node.val / 2 + fontSize);
        }}
      />

      {/* Selected node info */}
      {selectedNode && (
        <div className="absolute top-4 right-4 p-4 bg-zinc-900 border border-zinc-700 rounded-lg w-64">
          <h3 className="font-medium text-lg">{selectedNode.name}</h3>
          {selectedNode.company && (
            <p className="text-zinc-400 text-sm">{selectedNode.company}</p>
          )}
          <span 
            className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full text-white"
            style={{ backgroundColor: TIER_HEX[selectedNode.tier] }}
          >
            {selectedNode.tier.replace('_', ' ')}
          </span>
          <div className="mt-3">
            <a 
              href={`/contact/${selectedNode.id}`}
              className="text-pink-500 text-sm hover:underline"
            >
              View details →
            </a>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 p-3 bg-zinc-900/80 rounded-lg text-xs">
        <div className="flex flex-wrap gap-2">
          {Object.entries(TIER_HEX).map(([tier, color]) => (
            <div key={tier} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-zinc-400">{tier.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
