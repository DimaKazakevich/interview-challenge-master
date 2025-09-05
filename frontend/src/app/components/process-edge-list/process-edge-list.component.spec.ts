import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessEdgeListComponent } from './process-edge-list.component';
import { ProcessGraph } from '../../models/process-graph.model';

describe('ProcessEdgeListComponent', () => {
  let component: ProcessEdgeListComponent;
  let fixture: ComponentFixture<ProcessEdgeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessEdgeListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessEdgeListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const empty: ProcessGraph = { nodes: [], edges: [] };
    component.graph = empty;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render title when provided', () => {
    component.title = 'Initial Path';
    const empty: ProcessGraph = { nodes: [], edges: [] };
    component.graph = empty;
    fixture.detectChanges();
    const h3: HTMLElement | null = fixture.nativeElement.querySelector('h3');
    expect(h3?.textContent).toContain('Initial Path');
  });

  it('should render edges list', () => {
    const graph: ProcessGraph = {
      nodes: [
        { id: 1, name: 'Start', type: 'Start' },
        { id: 2, name: 'Task', type: 'HumanTask' },
      ],
      edges: [{ from: 1, to: 2 }],
    };
    component.graph = graph;
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('ul li');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Start (Start)');
    expect(items[0].textContent).toContain('Task (HumanTask)');
  });
});
