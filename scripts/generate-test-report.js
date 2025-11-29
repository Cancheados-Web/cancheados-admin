/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function addPct(section) {
  return {
    ...section,
    pct: section.total ? (section.covered * 100) / section.total : 0
  };
}

function computeFrontendCoverage() {
  const finalPath = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
  if (!fs.existsSync(finalPath)) return null;

  const raw = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
  const totals = {
    statements: { total: 0, covered: 0 },
    functions: { total: 0, covered: 0 },
    branches: { total: 0, covered: 0 },
    lines: { total: 0, covered: 0 }
  };

  for (const file of Object.values(raw)) {
    const statements = file.s || {};
    const funcs = file.f || {};
    const branches = file.b || {};

    totals.statements.total += Object.keys(statements).length;
    totals.statements.covered += Object.values(statements).filter((n) => n > 0).length;

    totals.functions.total += Object.keys(funcs).length;
    totals.functions.covered += Object.values(funcs).filter((n) => n > 0).length;

    totals.branches.total += Object.values(branches).reduce((acc, arr) => acc + arr.length, 0);
    totals.branches.covered += Object.values(branches).reduce(
      (acc, arr) => acc + arr.filter((n) => n > 0).length,
      0
    );

    const lineSet = new Set();
    const coveredLineSet = new Set();
    const statementMap = file.statementMap || {};
    for (const [id, count] of Object.entries(statements)) {
      const stmt = statementMap[id];
      if (stmt && stmt.start?.line) {
        lineSet.add(stmt.start.line);
        if (count > 0) coveredLineSet.add(stmt.start.line);
      }
    }
    totals.lines.total += lineSet.size;
    totals.lines.covered += coveredLineSet.size;
  }

  return {
    lines: addPct(totals.lines),
    statements: addPct(totals.statements),
    branches: addPct(totals.branches),
    functions: addPct(totals.functions)
  };
}

function readBackendReport() {
  const backendPath = path.join(__dirname, '..', '..', 'cancheados-backend', 'test-report.json');
  if (!fs.existsSync(backendPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(backendPath, 'utf8'));
  } catch {
    return null;
  }
}

function buildReport() {
  const frontendCoverage = computeFrontendCoverage();
  const backend = readBackendReport();

  return {
    generatedAt: new Date().toISOString(),
    frontend: {
      project: 'admin',
      status: frontendCoverage ? 'passed' : 'missing',
      coverage: frontendCoverage
    },
    backend: backend || { project: 'backend', status: 'missing', coverage: null }
  };
}

function writeReport(report) {
  const targets = [
    path.join(__dirname, '..', 'test-report.json'),
    path.join(__dirname, '..', 'public', 'test-report.json')
  ];
  targets.forEach((dest) => {
    fs.writeFileSync(dest, JSON.stringify(report, null, 2));
    console.log(`Wrote test report to ${dest}`);
  });
}

try {
  const report = buildReport();
  writeReport(report);
} catch (err) {
  console.error('Failed to generate test report', err);
  process.exitCode = 1;
}
