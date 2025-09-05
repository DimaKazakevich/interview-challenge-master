import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessFlowComponent } from './process-flow.component';
import { SimpleChange } from '@angular/core';
import { ProcessGraph } from '../../models/process-graph.model';

type LeaderLineCtor = new (
  start: Element,
  end: Element,
  options?: { color?: string; size?: number; path?: string; [key: string]: unknown }
) => { remove(): void };

declare global {
  // eslint-disable-next-line no-var
  var LeaderLine: LeaderLineCtor;
}

describe('ProcessFlowComponent', () => {
  let component: ProcessFlowComponent;
  let fixture: ComponentFixture<ProcessFlowComponent>;

  beforeEach(async () => {
    // Stub LeaderLine globally
    class LeaderLineMock {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_s: Element, _e: Element, _o?: { color?: string; size?: number; path?: string; [key: string]: unknown }) {}
      remove(): void {}
    }
    (globalThis as { LeaderLine: LeaderLineCtor }).LeaderLine = LeaderLineMock as unknown as LeaderLineCtor;

    await TestBed.configureTestingModule({
      imports: [ProcessFlowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessFlowComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    const empty: ProcessGraph = { nodes: [], edges: [] };
    component.graph = empty;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render nodes and set anchor IDs', async () => {
    const graph: ProcessGraph = {
      nodes: [
        { id: 1, name: 'Start', type: 'Start' },
        { id: 2, name: 'Task', type: 'HumanTask' },
      ],
      edges: [],
    };

    component.graph = graph;
    fixture.detectChanges();
    await fixture.whenStable();

    const imgs: NodeListOf<HTMLImageElement> =
      fixture.nativeElement.querySelectorAll('img.icon');
    expect(imgs.length).toBe(2);
    expect(imgs[0].id).toBe('node-1');
    expect(imgs[1].id).toBe('node-2');
  });

  it('should create leader lines for edges', async () => {
    const lineSpy = jasmine.createSpy('LeaderLine');
    const LeaderLineFn: LeaderLineCtor = function (
      start: Element,
      end: Element,
      options?: { color?: string; size?: number; path?: string; [key: string]: unknown }
    ) {
      lineSpy(start, end, options);
      return { remove(): void {} };
    } as unknown as LeaderLineCtor;
    (globalThis as { LeaderLine: LeaderLineCtor }).LeaderLine = LeaderLineFn;

    const graph: ProcessGraph = {
      nodes: [
        { id: 1, name: 'Start', type: 'Start' },
        { id: 2, name: 'Task', type: 'HumanTask' },
      ],
      edges: [{ from: 1, to: 2 }],
    };

    component.graph = graph;

    // First render nodes so their elements exist in the DOM
    fixture.detectChanges();
    await fixture.whenStable();

    // Now trigger ngOnChanges to run drawLines after DOM is ready
    component.ngOnChanges({ graph: new SimpleChange(null, component.graph, false) });

    // Wait a tick for microtask queued in component
    await Promise.resolve();

    expect(lineSpy).toHaveBeenCalled();
  });
});
