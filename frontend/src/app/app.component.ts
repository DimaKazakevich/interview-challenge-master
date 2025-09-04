import { Component } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common'
import { environment } from './environments/environment';

declare const LeaderLine: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedFile: File | null = null;
  optimizedResult: ProcessGraph | null = null;
  initialResult: ProcessGraph | null = null;
  error: string | null = null;
  warn: string | null = null;
  renderedNodeIds: Set<string> = new Set();
  renderedNodeIds1: Set<string> = new Set();
  initialLines: any[] = [];
  optimizedLines: any[] = [];


  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed: ProcessGraph = JSON.parse(reader.result as string);
        this.initialResult = parsed;
        this.optimizedResult = null;
        this.renderedNodeIds.clear();
        this.clearLines('all');

        const gatewayIds = new Set(
          this.initialResult.nodes
          .filter((n) => String(n.type).toUpperCase() === 'GATEWAY')
          .map((n) => n.id)
        );

        gatewayIds.forEach((gatewayId) => {
          const branchTargets = this.initialResult?.edges
          .filter((e) => e.from === gatewayId)
          .map((e) => e.to);

          if (branchTargets && branchTargets.length > 1) {
            branchTargets.forEach((targetId) => this.renderedNodeIds.add(String(targetId)));
          }
        });

        setTimeout(() => this.drawLines(this.initialResult!, 'initial'), 0);
      } catch {
        this.error = 'Invalid JSON in file';
      }
    };

    reader.readAsText(this.selectedFile);
  }

  onSubmit(): void {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http
    .post<ProcessGraph>(`${environment.apiUrl}/optimize/process-file`, formData)
    .subscribe({
      next: (res) => {
        this.optimizedResult = res;
        this.error = null;
        if (this.optimizedLines.length === 0) {
          this.clearLines('optimized');
          setTimeout(() => this.drawLines(this.optimizedResult!, 'optimized'), 0);
        }
      },
      error: (err) => {
        this.error = err?.error || 'Unexpected error';
        this.optimizedResult = null;
      }
    });
  }

  getNodeName(id: number, graph: ProcessGraph): string {
    const node = graph.nodes.find((n) => String(n.id) === String(id));
    return node ? `${node.name} (${node.type})` : id.toString();
  }

  getNodeById(id: string): ProcessNode | null {
    if (!this.initialResult) return null;
    return this.initialResult.nodes.find((n) => String(n.id) === id) || null;
  }

  getNodeCssClassById(id: string): string {
    const node = this.getNodeById(id);
    return node ? this.getNodeCssClass(node) : '';
  }

  getNodeIconUrlById(id: string): string {
    const node = this.getNodeById(id);
    return node ? this.getNodeIconUrl(node) : '';
  }

  getNodeNameById(id: string): string {
    const node = this.getNodeById(id);
    return node ? node.name : id;
  }

  getNodeCssClass(node: ProcessNode): string {
    switch (node.type) {
      case 'Start':
        return 'start';
      case 'End':
        return 'end';
      case 'HumanTask':
        return 'human';
      case 'ServiceTask':
        return 'service';
      case 'Gateway':
        return 'gateway';
      default:
        return '';
    }
  }

  getNodeIconUrl(node: ProcessNode): string {
    switch (node.type) {
      case 'Start':
        return 'assets/icons/start-event.svg';
      case 'End':
        return 'assets/icons/end-event.svg';
      case 'HumanTask':
        return 'assets/icons/user-task.svg';
      case 'ServiceTask':
        return 'assets/icons/service-task.svg';
      case 'Gateway':
        return 'assets/icons/gateway-xor.svg';
      default:
        return 'assets/icons/round-not-listed-location.svg';
    }
  }

  isGatewayWithBranches(node: ProcessNode): boolean {
    if (!this.initialResult) return false;
    const type = String(node.type).toUpperCase();
    if (type !== 'GATEWAY') return false;

    const outgoing = this.initialResult.edges.filter((e) => e.from === node.id);
    return outgoing.length > 1;
  }

  getBranchTargets(node: ProcessNode): string[] {
    if (!this.initialResult) return [];

    const targets = this.initialResult.edges
    .filter((e) => e.from === node.id)
    .map((e) => String(e.to))
    .filter((id, index, self) => self.indexOf(id) === index);

    targets.forEach((id) => this.renderedNodeIds.add(id));
    return targets;
  }

  shouldRenderNode(node: ProcessNode): boolean {
    return !this.renderedNodeIds.has(String(node.id));
  }

  shouldRenderNode1(node: ProcessNode): boolean {
    return !this.renderedNodeIds1.has(String(node.id));
  }

  drawLines(graph: ProcessGraph, type: 'initial' | 'optimized'): void {
    const linesList = type === 'initial' ? this.initialLines : this.optimizedLines;
    const prefix = type === 'initial' ? '' : 'optimized-';

    graph.edges.forEach((edge) => {
      const fromEl =
        document.getElementById(`node-${prefix}${edge.from}`) ||
        document.getElementById(`node-${prefix}${edge.from}-branch`);

      const toEl =
        document.getElementById(`node-${prefix}${edge.to}`) ||
        document.getElementById(`node-${prefix}${edge.to}-branch`);

      if (fromEl && toEl) {
        const line = new LeaderLine(fromEl, toEl, {
          color: 'black',
          size: 3,
          path: 'arc',
        });
        linesList.push(line);
      }
    });
  }


  clearLines(type: 'initial' | 'optimized' | 'all' = 'all'): void {
    if (type === 'initial' || type === 'all') {
      this.initialLines.forEach((line) => line.remove());
      this.initialLines = [];
    }
    if (type === 'optimized' || type === 'all') {
      this.optimizedLines.forEach((line) => line.remove());
      this.optimizedLines = [];
    }
  }
}

export interface ProcessNode {
  id: number;
  name: string;
  type: 'Start' | 'End' | 'HumanTask' | 'ServiceTask' | 'Gateway' | string;
}

export interface ProcessEdge {
  from: number;
  to: number;
}

export interface ProcessGraph {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
}

