import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import * as d3 from 'd3';
import { TreeActions, TreeNode, TreeEdge } from '../../../core/store/tree/tree.actions';
import { selectTreeNodes, selectTreeEdges, selectTreeLoading } from '../../../core/store/tree/tree.selectors';

interface SimNode extends TreeNode, d3.SimulationNodeDatum {}

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

    const parentEdges = edges.filter((e) => e.type === 'PARENT_OF');
    const spouseEdges = edges.filter((e) => e.type === 'SPOUSE_OF');

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n }));

    const links = [
      ...parentEdges.map((e) => ({ source: e.fromMemberId, target: e.toMemberId, type: 'parent' })),
      ...spouseEdges
        .filter((e) => e.fromMemberId < e.toMemberId)
        .map((e) => ({ source: e.fromMemberId, target: e.toMemberId, type: 'spouse' })),
    ];

    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink<SimNode, typeof links[0]>(links)
        .id((d) => d.id)
        .distance((d) => d.type === 'spouse' ? 80 : 120))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('y', d3.forceY().strength(0.1));

    const link = g.append('g').selectAll('line').data(links).enter().append('line')
      .attr('stroke', (d) => d.type === 'spouse' ? '#e91e63' : '#1a73e8')
      .attr('stroke-width', (d) => d.type === 'spouse' ? 2 : 1.5)
      .attr('stroke-dasharray', (d) => d.type === 'spouse' ? '5,3' : 'none');

    const node = g.append('g').selectAll<SVGGElement, SimNode>('g').data(simNodes).enter().append('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => this.router.navigate(['/directory', d.id]))
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    node.append('circle')
      .attr('r', 28)
      .attr('fill', (d) => d.gender === 'MALE' ? '#90caf9' : d.gender === 'FEMALE' ? '#f48fb1' : '#a5d6a7')
      .attr('stroke', (d) => d.isLiving ? '#1a73e8' : '#9e9e9e')
      .attr('stroke-width', 2)
      .attr('opacity', (d) => d.isLiving ? 1 : 0.6);

    node.append('text')
      .attr('text-anchor', 'middle').attr('dy', '0.35em').attr('font-size', '10px')
      .text((d) => d.firstName.substring(0, 6));

    node.append('title').text((d) => `${d.firstName} ${d.lastName}`);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimNode).x!)
        .attr('y1', (d) => (d.source as SimNode).y!)
        .attr('x2', (d) => (d.target as SimNode).x!)
        .attr('y2', (d) => (d.target as SimNode).y!);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });
  }
}
