import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessUploadComponent } from './process-upload.component';
import { ProcessGraph } from '../../models/process-graph.model';

function createFile(contents: string, name = 'test.json', type = 'application/json'): File {
  const blob = new Blob([contents], { type });
  return new File([blob], name, { type });
}

interface GlobalWithFileReader {
  FileReader: new () => FileReader;
}

describe('ProcessUploadComponent', () => {
  let component: ProcessUploadComponent;
  let fixture: ComponentFixture<ProcessUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcessUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit fileSelected and graphParsed on valid JSON file', async () => {
    const graph: ProcessGraph = { nodes: [], edges: [] };
    const file = createFile('irrelevant');

    type OnLoad = ((this: FileReader, ev: Event) => unknown) | null;
    const mockReader: Partial<FileReader> & { onload: OnLoad } = {
      onload: null,
      result: null,
      readAsText(this: FileReader, _blob: Blob) {
        (this as unknown as { result: string | ArrayBuffer | null }).result = JSON.stringify(graph);
        const handler = mockReader.onload;
        if (typeof handler === 'function') {
          const evt: Event = new ProgressEvent('load');
          handler.call(this, evt);
        }
      },
    };

    const globalRef = globalThis as unknown as GlobalWithFileReader;
    spyOn(globalRef, 'FileReader').and.returnValue(mockReader as FileReader);

    const fileSelectedSpy = spyOn(component.fileSelected, 'emit');
    const graphParsedSpy = spyOn(component.graphParsed, 'emit');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', { value: [file] });

    input.dispatchEvent(new Event('change'));

    expect(fileSelectedSpy).toHaveBeenCalledOnceWith(file);
    expect(graphParsedSpy).toHaveBeenCalledOnceWith(graph);
  });

  it('should emit parseError on invalid JSON file', async () => {
    const file = createFile('irrelevant');

    type OnLoad = ((this: FileReader, ev: Event) => unknown) | null;
    const mockReader: Partial<FileReader> & { onload: OnLoad } = {
      onload: null,
      result: null,
      readAsText(this: FileReader, _blob: Blob) {
        (this as unknown as { result: string | ArrayBuffer | null }).result = '{ invalid';
        const handler = mockReader.onload;
        if (typeof handler === 'function') {
          const evt: Event = new ProgressEvent('load');
          handler.call(this, evt);
        }
      },
    };

    const globalRef = globalThis as unknown as GlobalWithFileReader;
    spyOn(globalRef, 'FileReader').and.returnValue(mockReader as FileReader);

    const parseErrorSpy = spyOn(component.parseError, 'emit');

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="file"]');
    Object.defineProperty(input, 'files', { value: [file] });

    input.dispatchEvent(new Event('change'));

    expect(parseErrorSpy).toHaveBeenCalled();
  });
});
