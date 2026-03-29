import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { X } from 'lucide-react';
import api from '../api/client';

const DEMO_NODES = [
  { id: 'pnb.bank.in',        label: 'pnb.bank.in',        type: 'domain', pqc: 'unknown',     risk: 'Medium',   tls: 'TLS 1.3', shadow: false },
  { id: 'api.pnb.bank.in',    label: 'api.pnb.bank.in',    type: 'domain', pqc: 'vulnerable',  risk: 'High',     tls: 'TLS 1.2', shadow: false },
  { id: 'mobile.pnb.bank.in', label: 'mobile.pnb.bank.in', type: 'domain', pqc: 'vulnerable',  risk: 'Critical', tls: 'TLS 1.1', shadow: false },
  { id: 'auth.pnb.bank.in',   label: 'auth.pnb.bank.in',   type: 'domain', pqc: 'ready',       risk: 'Low',      tls: 'TLS 1.3', shadow: false },
  { id: '103.107.44.1',       label: '103.107.44.1',        type: 'ip',     pqc: 'unknown',     risk: 'Medium',   tls: '—',       shadow: false },
  { id: '192.168.10.50',      label: '192.168.10.50',       type: 'ip',     pqc: 'vulnerable',  risk: 'High',     tls: '—',       shadow: true  },
  { id: 'cert-1',             label: 'TLS Cert #1',         type: 'ssl',    pqc: 'ready',       risk: 'Low',      tls: 'TLS 1.3', shadow: false },
  { id: 'cert-2',             label: 'TLS Cert #2',         type: 'ssl',    pqc: 'vulnerable',  risk: 'High',     tls: 'TLS 1.2', shadow: false },
  { id: 'cdn-shadow.pnb.io',  label: 'cdn-shadow.pnb.io',  type: 'domain', pqc: 'unknown',     risk: 'Unknown',  tls: '—',       shadow: true  },
];

const DEMO_LINKS = [
  { source: 'pnb.bank.in',     target: '103.107.44.1'     },
  { source: 'pnb.bank.in',     target: 'cert-1'           },
  { source: 'api.pnb.bank.in', target: '103.107.44.1'     },
  { source: 'api.pnb.bank.in', target: 'cert-2'           },
  { source: 'mobile.pnb.bank.in', target: '103.107.44.1'  },
  { source: 'auth.pnb.bank.in',   target: '103.107.44.1'  },
  { source: '192.168.10.50',   target: 'cdn-shadow.pnb.io'},
  { source: 'pnb.bank.in',     target: 'api.pnb.bank.in'  },
  { source: 'pnb.bank.in',     target: 'auth.pnb.bank.in' },
];

const PQC_COLOR = { ready: '#10b981', vulnerable: '#ef4444', unknown: '#64748b' };

export default function NetworkGraph() {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState(DEMO_NODES);
  const [links, setLinks] = useState(DEMO_LINKS);
  const [selected, setSelected] = useState(null);
  const [pqcFilter, setPqcFilter] = useState('all');
  const [tableView, setTableView] = useState(false);

  useEffect(() => {
    api.get('/network/graph').then(r => {
      if (r.data.nodes) setNodes(r.data.nodes);
      if (r.data.links) setLinks(r.data.links);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (tableView || !svgRef.current) return;
    const el = svgRef.current;
    const W = el.clientWidth || 800, H = 500;
    d3.select(el).selectAll('*').remove();

    const filteredNodes = pqcFilter === 'all' ? nodes : nodes.filter(n => n.pqc === pqcFilter || n.shadow === (pqcFilter === 'shadow'));
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = links.filter(l => nodeIds.has(l.source?.id || l.source) && nodeIds.has(l.target?.id || l.target));

    const svg = d3.select(el).attr('width', W).attr('height', H);
    const g = svg.append('g');
    svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', e => g.attr('transform', e.transform)));

    const sim = d3.forceSimulation(filteredNodes)
      .force('link', d3.forceLink(filteredLinks).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(W / 2, H / 2));

    const link = g.append('g').selectAll('line').data(filteredLinks).enter().append('line')
      .attr('stroke', '#1e2d4a').attr('stroke-width', 1.5).attr('stroke-opacity', 0.7);

    const node = g.append('g').selectAll('g').data(filteredNodes).enter().append('g')
      .attr('cursor', 'pointer').call(d3.drag()
        .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
      .on('click', (_, d) => setSelected(d));

    // Shape per type
    node.each(function(d) {
      const col = PQC_COLOR[d.pqc] || '#64748b';
      const el = d3.select(this);
      if (d.type === 'domain') {
        el.append('circle').attr('r', 18).attr('fill', col + '22').attr('stroke', col).attr('stroke-width', 2);
      } else if (d.type === 'ip') {
        el.append('rect').attr('x', -14).attr('y', -14).attr('width', 28).attr('height', 28).attr('rx', 4)
          .attr('fill', col + '22').attr('stroke', col).attr('stroke-width', 2);
      } else {
        el.append('polygon').attr('points', '0,-16 14,8 -14,8')
          .attr('fill', col + '22').attr('stroke', col).attr('stroke-width', 2);
      }
      if (d.shadow) {
        el.append('circle').attr('r', 5).attr('cx', 12).attr('cy', -12)
          .attr('fill', '#f97316').attr('stroke', '#0a0e1a').attr('stroke-width', 1.5);
      }
    });

    node.append('text').text(d => d.label.length > 18 ? d.label.slice(0, 16) + '…' : d.label)
      .attr('y', 28).attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', '10px')
      .attr('font-family', 'Space Mono, monospace');

    sim.on('tick', () => {
      link.attr('x1', d => d.source.x).attr('y1', d => d.source.y).attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }, [nodes, links, pqcFilter, tableView]);

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[['all','All Nodes'],['vulnerable','Vulnerable'],['ready','PQC Ready'],['shadow','Shadow IT']].map(([v, l]) => (
          <button key={v} onClick={() => setPqcFilter(v)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: pqcFilter === v ? 'rgba(59,130,246,0.15)' : 'transparent',
            border: `1px solid ${pqcFilter === v ? '#3b82f6' : '#1e2d4a'}`, color: pqcFilter === v ? '#3b82f6' : '#64748b',
          }}>{l}</button>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => setTableView(p => !p)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: 'transparent', border: '1px solid #1e2d4a', color: '#64748b',
          }}>{tableView ? '◉ Graph View' : '☰ Table View'}</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['Circle','Domain',null],['Square','IP',null],['Triangle','SSL Cert',null],
          ['●','PQC Ready','#10b981'],['●','Vulnerable','#ef4444'],['●','Unknown','#64748b'],['●','Shadow IT','#f97316']]
          .map(([sym, lbl, col]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
            <span style={{ color: col || '#94a3b8' }}>{sym}</span> {lbl}
          </div>
        ))}
      </div>

      {tableView ? (
        <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid #1e2d4a' }}>
              {['Node','Type','PQC Status','Risk','TLS','Shadow'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {nodes.map((n, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #0d1525', cursor: 'pointer' }} onClick={() => setSelected(n)}>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#e2e8f0', fontFamily: 'Space Mono,monospace' }}>{n.label}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{n.type}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 12, fontWeight: 700, color: PQC_COLOR[n.pqc] }}>{n.pqc}</span></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{n.risk}</td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b', fontFamily: 'Space Mono,monospace' }}>{n.tls}</td>
                  <td style={{ padding: '12px 16px' }}>{n.shadow && <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316' }}>⚠ Shadow</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#111827', borderRadius: 14, border: '1px solid #1e2d4a', overflow: 'hidden' }}>
          <svg ref={svgRef} style={{ width: '100%', height: 500, display: 'block' }} />
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div style={{
          position: 'fixed', right: 0, top: 60, bottom: 0, width: 300,
          background: '#111827', borderLeft: '1px solid #1e2d4a',
          padding: 24, zIndex: 100, overflowY: 'auto', animation: 'slideIn 0.25s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9' }}>Node Details</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18}/></button>
          </div>
          {[['ID', selected.id],['Type', selected.type],['PQC', selected.pqc],['Risk', selected.risk],['TLS', selected.tls],['Shadow IT', selected.shadow ? 'Yes' : 'No']].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
