import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import * as d3 from 'd3';
import { TreeActions, TreeNode, TreeEdge } from '../../../core/store/tree/tree.actions';
import { selectTreeNodes, selectTreeEdges, selectTreeLoading } from '../../../core/store/tree/tree.selectors';

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tree-view.component.html',
  styleUrl: './tree-view.component.scss',
})
export class TreeViewComponent implements OnInit, OnDestroy {
  @ViewChild('treeSvg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  loading = true;
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(TreeActions.loadTree());

    combineLatest([
      this.store.select(selectTreeNodes),
      this.store.select(selectTreeEdges),
      this.store.select(selectTreeLoading),
    ]).pipe(takeUntil(this.destroy$)).subscribe(([nodes, edges, loading]) => {
      this.loading = loading;
      if (!loading && nodes.length > 0) {
        setTimeout(() => this.renderTree(nodes, edges), 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private renderTree(nodes: TreeNode[], edges: TreeEdge[]): void {
    const svgEl = this.svgRef.nativeElement;
    d3.select(svgEl).selectAll('*').remove();

    const width  = svgEl.clientWidth  || 800;
    const height = svgEl.clientHeight || 600;

    const svg = d3.select(svgEl).attr('width', width).attr('height', height);
    const g   = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    if (nodes.length === 0) return;

    // Build adjacency maps
    const parentEdges  = edges.filter((e) => e.type === 'PARENT_OF');
    const childrenOf   = new Map<string, string[]>();
    const parentsOf    = new Map<string, string[]>();
    for (const e of parentEdges) {
      if (!childrenOf.has(e.fromMemberId)) childrenOf.set(e.fromMemberId, []);
      childrenOf.get(e.fromMemberId)!.push(e.toMemberId);
      if (!parentsOf.has(e.toMemberId)) parentsOf.set(e.toMemberId, []);
      parentsOf.get(e.toMemberId)!.push(e.fromMemberId);
    }

    const spouseOf = new Map<string, string[]>();
    for (const e of edges.filter((e) => e.type === 'SPOUSE_OF')) {
      if (!spouseOf.has(e.fromMemberId)) spouseOf.set(e.fromMemberId, []);
      spouseOf.get(e.fromMemberId)!.push(e.toMemberId);
    }

    // Phase 1 — BFS via PARENT_OF
    const isMarriedIn = (id: string) =>
      (spouseOf.get(id) ?? []).some((sid) => parentsOf.has(sid));
    const trueRoots = nodes
      .filter((n) => !parentsOf.has(n.id) && childrenOf.has(n.id) && !isMarriedIn(n.id))
      .map((n) => n.id);
    const roots = trueRoots.length > 0
      ? trueRoots
      : nodes.filter((n) => !parentsOf.has(n.id) && !isMarriedIn(n.id)).map((n) => n.id);
    if (roots.length === 0) roots.push(nodes[0].id);

    const genLevel = new Map<string, number>();
    roots.forEach((id) => genLevel.set(id, 0));
    const queue = [...roots];
    while (queue.length) {
      const id = queue.shift()!;
      const gen = genLevel.get(id)!;
      for (const cid of (childrenOf.get(id) ?? [])) {
        if (!genLevel.has(cid)) { genLevel.set(cid, gen + 1); queue.push(cid); }
      }
    }

    // Phase 2 — propagate to spouses
    let changed = true;
    while (changed) {
      changed = false;
      for (const [id, gen] of genLevel) {
        for (const sid of (spouseOf.get(id) ?? [])) {
          if (!genLevel.has(sid)) { genLevel.set(sid, gen); changed = true; }
        }
      }
    }

    // Phase 3 — leftover nodes
    let maxGen = 0;
    for (const g of genLevel.values()) { if (g > maxGen) maxGen = g; }
    for (const n of nodes) {
      if (!genLevel.has(n.id)) genLevel.set(n.id, ++maxGen);
    }

    // Group by generation, place spouses next to each other
    const byGen = new Map<number, string[]>();
    for (const [id, gen] of genLevel) {
      if (!byGen.has(gen)) byGen.set(gen, []);
      byGen.get(gen)!.push(id);
    }
    for (const [gen, ids] of byGen) {
      const sorted: string[] = [];
      const seen = new Set<string>();
      for (const id of ids) {
        if (seen.has(id)) continue;
        sorted.push(id); seen.add(id);
        for (const sid of (spouseOf.get(id) ?? [])) {
          if (!seen.has(sid) && ids.includes(sid)) { sorted.push(sid); seen.add(sid); }
        }
      }
      byGen.set(gen, sorted);
    }

    // Compute positions
    const NODE_R = 26;
    const H_GAP  = 100;
    const V_GAP  = 150;
    const maxRow = (() => { let m = 0; for (const a of byGen.values()) { if (a.length > m) m = a.length; } return m; })();
    const treeW  = Math.max(width,  maxRow * H_GAP + H_GAP);
    const treeH  = (maxGen + 1) * V_GAP;

    const pos = new Map<string, { x: number; y: number }>();
    for (const [gen, ids] of byGen) {
      const rowW   = (ids.length - 1) * H_GAP;
      const startX = treeW / 2 - rowW / 2;
      ids.forEach((id, i) => pos.set(id, { x: startX + i * H_GAP, y: (gen + 0.5) * V_GAP }));
    }

    // Edges
    const linkG = g.append('g');
    for (const e of parentEdges) {
      const s = pos.get(e.fromMemberId);
      const t = pos.get(e.toMemberId);
      if (!s || !t) continue;
      const midY = (s.y + t.y) / 2;
      linkG.append('path')
        .attr('d', `M${s.x},${s.y + NODE_R} C${s.x},${midY} ${t.x},${midY} ${t.x},${t.y - NODE_R}`)
        .attr('fill', 'none')
        .attr('stroke', '#D8CABB')
        .attr('stroke-width', 1.5);
    }
    for (const e of edges.filter((e) => e.type === 'SPOUSE_OF' && e.fromMemberId < e.toMemberId)) {
      const s = pos.get(e.fromMemberId);
      const t = pos.get(e.toMemberId);
      if (!s || !t) continue;
      linkG.append('line')
        .attr('x1', s.x).attr('y1', s.y)
        .attr('x2', t.x).attr('y2', t.y)
        .attr('stroke', '#E8845C')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,3');
    }

    // Nodes
    const nodeG = g.append('g')
      .selectAll<SVGGElement, TreeNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => { const p = pos.get(d.id) ?? { x: 0, y: 0 }; return `translate(${p.x},${p.y})`; })
      .style('cursor', 'pointer')
      .on('click', (_evt, d) => this.router.navigate(['/directory', d.id]));

    nodeG.append('circle')
      .attr('r', NODE_R)
      .attr('fill', (d) => d.gender === 'MALE' ? '#EDE3D6' : d.gender === 'FEMALE' ? '#F2C4A8' : '#D8CABB')
      .attr('stroke', (d) => d.isLiving ? '#C4623A' : '#BFA48C')
      .attr('stroke-width', 1.5)
      .attr('opacity', (d) => d.isLiving ? 1 : 0.55);

    nodeG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '9px')
      .attr('font-family', 'Jost, sans-serif')
      .attr('fill', '#2E1A0E')
      .text((d) => d.firstName.substring(0, 5));

    nodeG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', NODE_R + 13)
      .attr('font-size', '10px')
      .attr('font-family', 'Jost, sans-serif')
      .attr('fill', '#5C3820')
      .text((d) => `${d.firstName} ${d.lastName}`);

    nodeG.append('title').text((d) => `${d.firstName} ${d.lastName}`);

    // Initial fit
    const sx = width  / treeW;
    const sy = height / treeH;
    const sc = Math.min(1, sx, sy) * 0.9;
    const tx = width  / 2 - (treeW / 2) * sc;
    const ty = height / 2 - (treeH / 2) * sc;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(sc));
  }
}
