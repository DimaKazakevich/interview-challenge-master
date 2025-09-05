import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessGraph } from '../../models/process-graph.model';

@Component({
  selector: 'app-process-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process-upload.component.html',
  styleUrls: ['./process-upload.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessUploadComponent {
  @Output() graphParsed = new EventEmitter<ProcessGraph>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() parseError = new EventEmitter<string>();

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.fileSelected.emit(file);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: ProcessGraph = JSON.parse(reader.result as string);
        this.graphParsed.emit(parsed);
      } catch {
        this.parseError.emit('Invalid JSON in file');
      }
    };

    reader.readAsText(file);
  }
}
