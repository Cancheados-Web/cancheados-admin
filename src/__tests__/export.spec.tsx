import { describe, expect, it, vi, afterEach } from 'vitest';
import { exportToCSV, exportToPDF } from '../lib/utils/export';

const pdfSpies = vi.hoisted(() => ({
  setFontSize: vi.fn(),
  text: vi.fn(),
  save: vi.fn(),
  ctor: vi.fn()
}));

vi.mock('jspdf', () => ({
  __esModule: true,
  default: function MockDoc() {
    pdfSpies.ctor();
    return {
      setFontSize: pdfSpies.setFontSize,
      text: pdfSpies.text,
      save: pdfSpies.save
    };
  }
}));

const autoTableSpy = vi.hoisted(() => vi.fn());
vi.mock('jspdf-autotable', () => ({
  __esModule: true,
  default: (...args) => autoTableSpy(...args)
}));

  if (!URL.createObjectURL) {
    // @ts-ignore
    URL.createObjectURL = vi.fn();
  }

afterEach(() => {
  vi.restoreAllMocks();
  autoTableSpy.mockReset();
  pdfSpies.setFontSize.mockReset();
  pdfSpies.text.mockReset();
  pdfSpies.save.mockReset();
  pdfSpies.ctor.mockReset();
});

describe('exportToCSV', () => {
  it('alerts when there is no data', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    exportToCSV([], 'empty');
    expect(alertSpy).toHaveBeenCalledWith('No data to export');
  });

  it('creates a CSV blob and triggers download', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    let lastBlob: Blob | null = null;
    const objectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      lastBlob = blob as Blob;
      return 'blob://mock';
    });

    // jsdom provides a real document; we use a real anchor and intercept click
    const clickSpy = vi.fn();
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const el = realCreate(tagName);
      // @ts-ignore
      el.click = clickSpy;
      return el;
    });

    exportToCSV(
      [
        { name: 'Alice', score: 10, note: 'ok' },
        { name: 'Bob', score: 20, note: 'has, comma' }
      ],
      'report'
    );

    expect(alertSpy).not.toHaveBeenCalled();
    expect(objectUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(lastBlob).toBeInstanceOf(Blob);
  });
});

describe('exportToPDF', () => {
  it('alerts when there is no data', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    exportToPDF([], 'empty', 'Title');
    expect(alertSpy).toHaveBeenCalledWith('No data to export');
  });

  it('passes headers and rows to autoTable and saves file', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    exportToPDF([{ col1: 'A', col2: 'B' }, { col1: 'C', col2: 'D' }], 'report', 'My Title');

    expect(alertSpy).not.toHaveBeenCalled();
    expect(pdfSpies.setFontSize).toHaveBeenCalledWith(16);
    expect(pdfSpies.text).toHaveBeenCalledWith('My Title', 14, 15);
    expect(autoTableSpy).toHaveBeenCalledTimes(1);
    const args = autoTableSpy.mock.calls[0][1];
    expect(args.head[0]).toEqual(['col1', 'col2']);
    expect(args.body).toEqual([['A', 'B'], ['C', 'D']]);
    expect(pdfSpies.save).toHaveBeenCalledWith('report.pdf');
  });
});
