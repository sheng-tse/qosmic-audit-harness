#!/usr/bin/env node
// Regression guard for eval/grade.mjs. Grades the frozen fixtures in this directory
// and asserts each expected outcome; exits non-zero on any mismatch so CI and the
// code-reviewer catch a grader that has drifted.
//
//   node eval/cases/run.mjs        (or: npm run test:eval)
//
// Cases:
//   gold   — a grounded report; green at 100 with grounding AND tech-fidelity Pass.
//   anchor — reference/target_report.anchor.md graded with no manifest; green at 100
//            with grounding and tech-fidelity Skip (the manifest-optional path).
//   broken — the gold report with one defect each, every one flipping a different
//            critical check and the gate. This is the heart of the guard.

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const CASES = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(dirname(CASES)); // eval/cases -> eval -> repo root
const GRADER = join(ROOT, 'eval', 'grade.mjs');
const GOLD_MANIFEST = join(CASES, 'gold', 'manifest.json');
const goldReport = readFileSync(join(CASES, 'gold', 'report.md'), 'utf8');

// Everything is graded in a scratch dir so the grader's eval.json never lands in a
// committed directory. node's fs.rmSync cleans it up (not the shell's rm).
const scratch = mkdtempSync(join(tmpdir(), 'qosmic-cases-'));

const failures = [];
function expect(label, cond, detail) {
  if (cond) { console.log(`  ok    ${label}`); return; }
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  failures.push(label);
}

const statusOf = (ev, key) => ev?.checks?.find((c) => c.key === key)?.status;

// Stage a report under scratch/<name>/, optionally copying the gold manifest beside
// it, and grade it. Returns { code, eval } where eval is the parsed eval.json.
function gradeCase(name, reportText, withManifest) {
  const dir = join(scratch, name);
  mkdirSync(dir, { recursive: true });
  const reportPath = join(dir, 'report.md');
  writeFileSync(reportPath, reportText);
  const args = [GRADER, reportPath];
  if (withManifest) {
    copyFileSync(GOLD_MANIFEST, join(dir, 'manifest.json'));
    args.push('--manifest', join(dir, 'manifest.json'));
  }
  const res = spawnSync('node', args, { encoding: 'utf8' });
  let parsed = null;
  try { parsed = JSON.parse(readFileSync(join(dir, 'eval.json'), 'utf8')); } catch { /* grader died before writing */ }
  return { code: res.status, eval: parsed };
}

console.log('gold (grounded, full grader):');
{
  const g = gradeCase('gold', goldReport, true);
  expect('exits 0', g.code === 0, `exit ${g.code}`);
  expect('gate pass', g.eval?.gate === 'pass', `gate ${g.eval?.gate}`);
  expect('score 100', g.eval?.score === 100, `score ${g.eval?.score}`);
  expect('grounding Pass', statusOf(g.eval, 'grounding') === 'Pass', statusOf(g.eval, 'grounding'));
  expect('tech-fidelity Pass', statusOf(g.eval, 'tech-fidelity') === 'Pass', statusOf(g.eval, 'tech-fidelity'));
}

console.log('anchor (manifest-less, optional path):');
{
  const g = gradeCase('anchor', readFileSync(join(ROOT, 'reference', 'target_report.anchor.md'), 'utf8'), false);
  expect('exits 0', g.code === 0, `exit ${g.code}`);
  expect('gate pass', g.eval?.gate === 'pass', `gate ${g.eval?.gate}`);
  expect('score 100', g.eval?.score === 100, `score ${g.eval?.score}`);
  expect('grounding Skip', statusOf(g.eval, 'grounding') === 'Skip', statusOf(g.eval, 'grounding'));
  expect('tech-fidelity Skip', statusOf(g.eval, 'tech-fidelity') === 'Skip', statusOf(g.eval, 'tech-fidelity'));
}

// One defect each, on a unique anchor in the gold report. The "mutation changed
// something" assertion catches fixture drift that would silently make a defect a no-op.
const broken = [
  { name: 'broken-grounding', check: 'grounding', mutate: (s) => s.replace('screenshots/product-gin-gins-original.png', 'screenshots/ghost-not-in-manifest.png') },
  { name: 'broken-tech', check: 'tech-fidelity', mutate: (s) => s.replace('| Favicon | Pass |', '| Favicon | Fail |') },
  // deletes the LAST experiment up to the competitor section; keep exp-a2e7c419b8f3 last or update this id
  { name: 'broken-count', check: 'experiments', mutate: (s) => s.replace(/### exp-a2e7c419b8f3[\s\S]*?(?=## Competitor)/, '') },
  { name: 'broken-coverage', check: 'pillar-coverage', mutate: (s) => s.replace('**Pillar:** Performance', '**Pillar:** Conversion') },
];
for (const b of broken) {
  console.log(`${b.name} (expect ${b.check} Fail):`);
  const text = b.mutate(goldReport);
  expect('mutation changed the report', text !== goldReport, 'no-op; the fixture drifted');
  const g = gradeCase(b.name, text, true);
  expect('exits non-zero', g.code !== 0, `exit ${g.code}`);
  expect('gate fail', g.eval?.gate === 'fail', `gate ${g.eval?.gate}`);
  expect(`${b.check} Fail`, statusOf(g.eval, b.check) === 'Fail', statusOf(g.eval, b.check));
}

rmSync(scratch, { recursive: true, force: true });

if (failures.length) {
  console.log(`\n${failures.length} assertion(s) failed.`);
  process.exit(1);
}
console.log('\nall cases passed.');
