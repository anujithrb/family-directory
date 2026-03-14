import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import * as d3 from 'd3';
import { TreeActions, TreeNode, TreeEdge } from '../../../core/store/tree/tree.actions';
import { selectTreeNodes, selectTreeEdges, selectTreeLoading } from '../../../core/store/tree/tree.selectors';

@Component({
  selector: 'app-tree-view',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="tree-container">
      <div *ngIf="loading" class="loading-center"><mat-spinner></mat-spinner></div>
      <svg #treeSvg class="tree-svg" [class.hidden]="loading"></svg>
      <div class="tree-instructions">
        <small>Pan: drag &bull; Zoom: scroll/pinch &bull; Click node: view profile</small>
      </div>
    </div>
  `,
  styles: [`
    .tree-container { width: 100%; height: calc(100vh - 120px); position: relative; overflow: hidden; }
    .tree-svg { width: 100%; height: 100%; }
    .hidden { display: none; }
    .loading-center { display: flex; justify-content: center; align-items: center; height: 100%; }
    .tree-instructions {
      position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.6); color: white; padding: 4px 12px; border-radius: 12px;
    }
  `],
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

    const width = svgEl.clientWidth || 800;
    const height = svgEl.clientHeight || 600;

    const svg = d3.select(svgEl).attr('width', width).attr('height', height);
    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(zoom);

    if (nodes.length === 0) return;

    // Build parent↔child and spouse adjacency maps
    const parentEdges = edges.filter((e) => e.type === 'PARENT_OF');
    const childrenOf = new Map<string, string[]>();
    const parentsOf = new Map<string, string[]>();
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

    // Phase 1 – BFS via PARENT_OF only.
    // Roots are nodes with no parents that also have children (true ancestors),
    // but excluding nodes whose spouses have parents (they are married-in spouses of descendants).
    // Falling back to all parentless non-married-in nodes when no such roots exist.
    const isMarriedIntoTree = (id: string): boolean =>
      (spouseOf.get(id) ?? []).some((spouseId) => parentsOf.has(spouseId));
    const trueRoots = nodes
      .filter((n) => !parentsOf.has(n.id) && childrenOf.has(n.id) && !isMarriedIntoTree(n.id))
      .map((n) => n.id);
    const roots = trueRoots.length > 0
      ? trueRoots
      : nodes.filter((n) => !parentsOf.has(n.id) && !isMarriedIntoTree(n.id)).map((n) => n.id);
    if (roots.length === 0) roots.push(nodes[0].id);

    const genLevel = new Map<string, number>();
    roots.forEach((id) => genLevel.set(id, 0));
    const queue: string[] = [...roots];

    while (queue.length > 0) {
      const id = queue.shift()!;
      const gen = genLevel.get(id)!;
      for (const childId of (childrenOf.get(id) ?? [])) {
        if (!genLevel.has(childId)) {
          genLevel.set(childId, gen + 1);
          queue.push(childId);
        }
      }
    }

    // Phase 2 – propagate generation to spouses not yet assigned
    let changed = true;
    while (changed) {
      changed = false;
      for (const [id, gen] of genLevel) {
        for (const spouseId of (spouseOf.get(id) ?? [])) {
          if (!genLevel.has(spouseId)) {
            genLevel.set(spouseId, gen);
            changed = true;
          }
        }
      }
    }

    // Phase 3 – any remaining disconnected nodes get their own rows
    let maxGen = 0;
    for (const g of genLevel.values()) { if (g > maxGen) maxGen = g; }
    for (const n of nodes) {
      if (!genLevel.has(n.id)) {
        genLevel.set(n.id, ++maxGen);
      }
    }

    // Group nodes by generation; place spouses next to each other
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
        sorted.push(id);
        seen.add(id);
        for (const spouseId of (spouseOf.get(id) ?? [])) {
          if (!seen.has(spouseId) && ids.includes(spouseId)) {
            sorted.push(spouseId);
            seen.add(spouseId);
          }
        }
      }
      byGen.set(gen, sorted);
    }

    // Compute pixel positions
    const NODE_R = 28;
    const H_GAP = 110;
    const V_GAP = 160;

    const maxNodesInRow = (() => { let m = 0; for (const a of byGen.values()) { if (a.length > m) m = a.length; } return m; })();
    const treeWidth = Math.max(width, maxNodesInRow * H_GAP + H_GAP);
    const treeHeight = (maxGen + 1) * V_GAP;

    const pos = new Map<string, { x: number; y: number }>();
    for (const [gen, ids] of byGen) {
      const rowWidth = (ids.length - 1) * H_GAP;
      const startX = treeWidth / 2 - rowWidth / 2;
      ids.forEach((id, i) => {
        pos.set(id, { x: startX + i * H_GAP, y: (gen + 0.5) * V_GAP });
      });
    }

    // Draw edges
    const linkGroup = g.append('g');

    for (const e of parentEdges) {
      const s = pos.get(e.fromMemberId);
      const t = pos.get(e.toMemberId);
      if (!s || !t) continue;
      const midY = (s.y + t.y) / 2;
      linkGroup.append('path')
        .attr('d', `M${s.x},${s.y + NODE_R} C${s.x},${midY} ${t.x},${midY} ${t.x},${t.y - NODE_R}`)
        .attr('fill', 'none')
        .attr('stroke', '#1a73e8')
        .attr('stroke-width', 1.5);
    }

    for (const e of edges.filter((e) => e.type === 'SPOUSE_OF' && e.fromMemberId < e.toMemberId)) {
      const s = pos.get(e.fromMemberId);
      const t = pos.get(e.toMemberId);
      if (!s || !t) continue;
      linkGroup.append('line')
        .attr('x1', s.x).attr('y1', s.y)
        .attr('x2', t.x).attr('y2', t.y)
        .attr('stroke', '#e91e63')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,3');
    }

    // Draw nodes
    const nodeG = g.append('g')
      .selectAll<SVGGElement, TreeNode>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', (d) => {
        const p = pos.get(d.id) ?? { x: 0, y: 0 };
        return `translate(${p.x},${p.y})`;
      })
      .style('cursor', 'pointer')
      .on('click', (_evt, d) => this.router.navigate(['/directory', d.id]));

    nodeG.append('circle')
      .attr('r', NODE_R)
      .attr('fill', (d) => d.gender === 'MALE' ? '#90caf9' : d.gender === 'FEMALE' ? '#f48fb1' : '#a5d6a7')
      .attr('stroke', (d) => d.isLiving ? '#1a73e8' : '#9e9e9e')
      .attr('stroke-width', 2)
      .attr('opacity', (d) => d.isLiving ? 1 : 0.6);

    nodeG.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .text((d) => d.firstName.substring(0, 6));

    nodeG.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', NODE_R + 14)
      .attr('font-size', '11px')
      .attr('fill', '#333')
      .text((d) => `${d.firstName} ${d.lastName}`);

    nodeG.append('title').text((d) => `${d.firstName} ${d.lastName}`);

    // Fit and centre the tree in the viewport on initial render
    const scaleX = width / treeWidth;
    const scaleY = height / treeHeight;
    const initScale = Math.min(1, scaleX, scaleY) * 0.9;
    const tx = width / 2 - (treeWidth / 2) * initScale;
    const ty = height / 2 - (treeHeight / 2) * initScale;
    svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initScale));
  }
}
