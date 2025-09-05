import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessGraph } from '../../models/process-graph.model';

@Component({
  selector: 'app-process-edge-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process-edge-list.component.html',
  styleUrls: ['./process-edge-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessEdgeListComponent {
  @Input() graph!: ProcessGraph;
  @Input() title = '';

  getNodeName(id: number, graph: ProcessGraph): string {
    const node = graph.nodes.find((n) => String(n.id) === String(id));
    return node ? `${node.name} (${node.type})` : id.toString();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
