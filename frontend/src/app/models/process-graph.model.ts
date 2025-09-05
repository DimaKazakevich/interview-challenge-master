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
