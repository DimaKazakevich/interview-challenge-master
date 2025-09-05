import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BpmnOptimizationService } from './services/bpmn-optimization.service';
import { ProcessGraph } from './models/process-graph.model';
import { ProcessUploadComponent } from './components/process-upload/process-upload.component';
import { ProcessEdgeListComponent } from './components/process-edge-list/process-edge-list.component';
import { ProcessFlowComponent } from './components/process-flow/process-flow.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ProcessUploadComponent,
    ProcessEdgeListComponent,
    ProcessFlowComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnDestroy {
  selectedFile: File | null = null;
  optimizedProcessGraph: ProcessGraph | null = null;
  initialProcessGraph: ProcessGraph | null = null;
  error: string | null = null;
  warn: string | null = null;
  cdr = inject(ChangeDetectorRef);

  private readonly api = inject(BpmnOptimizationService);

  onGraphParsed(graph: ProcessGraph): void {
    this.initialProcessGraph = graph;
    this.optimizedProcessGraph = null;
  }

  onSubmit(): void {
    if (!this.selectedFile) return;
    this.api.optimizeProcessFile(this.selectedFile).subscribe({
      next: (res) => {
        this.optimizedProcessGraph = res;
        this.error = null;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err?.error || 'Unexpected error';
        this.optimizedProcessGraph = null;
      },
    });
  }

  ngOnDestroy(): void {}
}
