import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessGraph, ProcessNode } from '../../models/process-graph.model';

declare const LeaderLine: {
  new (
    start: Element,
    end: Element,
    options?: {
      color?: string;
      size?: number;
      path?: string;
      [key: string]: unknown;
    }
  ): { remove(): void };
};

@Component({
  selector: 'app-process-flow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process-flow.component.html',
  styleUrls: ['./process-flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessFlowComponent implements OnChanges, OnDestroy {
  @Input() graph!: ProcessGraph;
  @Input() optimized = false;

  private lines: Array<{ remove(): void }> = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['graph']) {
      queueMicrotask(() => {
        this.clearLines();
        if (this.graph) {
          this.drawLines(this.graph);
        }
      });
    }
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

  trackByNodeId(_: number, node: ProcessNode): number {
    return node.id;
  }

  private drawLines(graph: ProcessGraph): void {
    const prefix = this.optimized ? 'optimized-' : '';
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
        this.lines.push(line);
      }
    });
  }

  private clearLines(): void {
    this.lines.forEach((l) => l.remove());
    this.lines = [];
  }

  ngOnDestroy(): void {
    this.clearLines();
  }
}
