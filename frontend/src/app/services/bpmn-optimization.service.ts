import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { ProcessGraph } from '../models/process-graph.model';

@Injectable({ providedIn: 'root' })
export class BpmnOptimizationService {
  constructor(private httpClient: HttpClient) {}

  optimizeProcessFile(file: File): Observable<ProcessGraph> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<ProcessGraph>(
      `${environment.apiUrl}/optimize/process-file`,
      formData
    );
  }
}
