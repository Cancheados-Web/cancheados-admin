import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

type CoverageSection = {
  total: number;
  covered: number;
  pct: number;
};

type ProjectReport = {
  project: string;
  status: 'passed' | 'failed' | 'missing' | string;
  coverage: {
    lines: CoverageSection;
    statements: CoverageSection;
    branches: CoverageSection;
    functions: CoverageSection;
  } | null;
};

type TestReport = {
  generatedAt: string;
  frontend: ProjectReport;
  backend: ProjectReport;
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    passed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    missing: 'bg-gray-100 text-gray-800'
  };
  const colorClass = colors[status] || colors.missing;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
};

const CoverageRow = ({ label, data }: { label: string; data: CoverageSection }) => (
  <div className="flex items-center justify-between py-1">
    <div className="w-1/4 text-sm text-gray-600">{label}</div>
    <div className="w-1/2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${Math.min(data.pct, 100).toFixed(1)}%` }}
        />
      </div>
    </div>
    <div className="w-1/4 text-right text-sm text-gray-700 font-medium">
      {data.pct.toFixed(1)}% ({data.covered}/{data.total})
    </div>
  </div>
);

export default function TestReportPage() {
  const [report, setReport] = useState<TestReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/test-report.json', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`Failed to load test report (${res.status})`);
      }
      const data = (await res.json()) as TestReport;
      setReport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReport();
  }, []);

  const renderProject = (title: string, project: ProjectReport) => (
    <Card title={title}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">{project.project}</span>
        <StatusBadge status={project.status} />
      </div>

      {project.coverage ? (
        <div className="space-y-2">
          <CoverageRow label="Lines" data={project.coverage.lines} />
          <CoverageRow label="Statements" data={project.coverage.statements} />
          <CoverageRow label="Branches" data={project.coverage.branches} />
          <CoverageRow label="Functions" data={project.coverage.functions} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">No coverage data available.</p>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'No report available'}</p>
          <button
            onClick={loadReport}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Coverage Dashboard</h1>
          <p className="text-sm text-gray-600">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
        </div>
        <button
          onClick={loadReport}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderProject('Frontend (Admin)', report.frontend)}
        {renderProject('Backend API', report.backend)}
      </div>
    </div>
  );
}
