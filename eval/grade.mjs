#!/usr/bin/env node
// The deterministic gate of a Qosmic audit eval. Parses a report, scores it
// against the store's own crawl manifest on the things a script can judge with
// certainty, prints a scorecard, writes eval.json next to the report, and exits
// non-zero below the gate. The judged J1-J5 pass (eval/rubric.md) layers on top.
//
//   node eval/grade.mjs <report.md> [--manifest <path>]
//
// The manifest is found next to the report (sample_output/<host>/crawl/manifest.json)
// or passed explicitly. Without one, grounding and tech-fidelity are skipped rather
// than failed, so the grader still scores structure, schema, pillars, and prose.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';

const PILLARS = ['Conversion', 'AOV', 'Retention', 'Acquisition', 'Performance'];
const FIELDS = ['Pillar', 'Affected surface', 'URL', 'Evidence', 'Hypothesis', 'Primary change', 'Primary KPI', 'Decision rule', 'Expected lift', 'Confidence'];
const SECTIONS = ['Executive summary', 'Proposed experiments', 'Competitor analysis', 'Technical checks'];

// STYLE tells worth catching mechanically. Prose hygiene warns above a threshold,
// it does not gate; a sharp report can carry one em-dash without being a robot.
const LLM_WORDS = /\b(leverage|delve|tapestry|testament|underscore|elevate|unlock|realm|landscape|foster|seamless|robust|powerful|comprehensive|cutting-edge|world-class)\b/gi;
const THROAT = /\b(it'?s worth noting|it'?s important to|at its core|furthermore|moreover|additionally|in conclusion)\b/gi;

const Pass = (detail) => ({ status: 'Pass', detail });
const Warn = (detail) => ({ status: 'Warn', detail });
const Fail = (detail) => ({ status: 'Fail', detail });
const Skip = (detail) => ({ status: 'Skip', detail });

// ---------------------------------------------------------------- parsing

function splitSections(md) {
  const out = {};
  const re = /^##\s+(.+?)\s*$/gm;
  const heads = [...md.matchAll(re)];
  for (let i = 0; i < heads.length; i++) {
    const title = heads[i][1].trim();
    const start = heads[i].index + heads[i][0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : md.length;
    out[title.toLowerCase()] = { title, body: md.slice(start, end).trim(), order: i };
  }
  return out;
}

function parseExperiments(body) {
  if (!body) return [];
  const blocks = body.split(/^###\s+/m).slice(1);
  return blocks.map((block) => {
    const lines = block.split('\n');
    const head = lines[0].trim();
    const m = head.match(/^(exp-[0-9a-f]{12})\s*[—–-]\s*(.+)$/i);
    const exp = { id: m ? m[1] : null, idRaw: head.split(/\s+[—–-]\s+/)[0], title: m ? m[2].trim() : head, fields: {} };
    for (const line of lines.slice(1)) {
      const fm = line.match(/^\*\*([^:*]+):\*\*\s*(.*)$/);
      if (fm) exp.fields[fm[1].trim()] = fm[2].trim();
    }
    return exp;
  });
}

function parseTable(body) {
  if (!body) return [];
  const rows = body.split('\n').filter((l) => l.trim().startsWith('|'));
  const data = rows.filter((l) => !/^\|[\s:|-]+\|?$/.test(l.trim())); // drop the --- separator
  return data.map((l) => {
    const cells = l.split('|').map((c) => c.trim());
    if (cells[0] === '') cells.shift(); // leading pipe
    if (cells.length && cells[cells.length - 1] === '') cells.pop(); // trailing pipe, if any
    return cells;
  });
}

// ---------------------------------------------------------------- evidence

// Pull the cited artifact out of an Evidence field: a backticked path, then a bare
// path or URL, dropping any trailing "(note)".
function citedArtifact(evidence) {
  if (!evidence) return null;
  const tick = evidence.match(/`([^`]+)`/);
  let cite = tick ? tick[1] : evidence.replace(/\s*\(.*?\)\s*$/, '').trim();
  return cite || null;
}

function groundsIn(cite, manifest, crawlDir) {
  if (!cite) return false;
  if (/^https?:\/\//i.test(cite)) {
    const norm = (u) => u.replace(/\/+$/, '');
    return manifest.surfaces.some((s) => norm(s.url) === norm(cite));
  }
  const base = basename(cite);
  if (manifest.surfaces.some((s) => s.screenshot && basename(s.screenshot) === base)) return true;
  if (crawlDir && existsSync(join(crawlDir, 'screenshots', base))) return true;
  return false;
}

// ---------------------------------------------------------------- checks

function checkStructure(sections) {
  const present = SECTIONS.filter((s) => sections[s.toLowerCase()]);
  if (present.length < SECTIONS.length) {
    return { ...Fail(`missing section(s): ${SECTIONS.filter((s) => !sections[s.toLowerCase()]).join(', ')}`), critical: true };
  }
  const order = SECTIONS.map((s) => sections[s.toLowerCase()].order);
  const ordered = order.every((v, i) => i === 0 || v > order[i - 1]);
  return ordered ? { ...Pass('all four sections present and in order'), critical: true } : { ...Fail('sections out of order'), critical: true };
}

function checkCount(experiments) {
  return experiments.length === 10
    ? { ...Pass('exactly 10 experiments'), critical: true }
    : { ...Fail(`found ${experiments.length} experiments, expected 10`), critical: true };
}

function checkSchema(experiments) {
  const problems = [];
  for (const e of experiments) {
    const id = e.idRaw || '(no id)';
    if (!e.id) problems.push(`${id}: id is not exp-<12 hex>`);
    const missing = FIELDS.filter((f) => !e.fields[f]);
    if (missing.length) problems.push(`${id}: missing ${missing.join(', ')}`);
    if (e.fields.Pillar && !PILLARS.includes(e.fields.Pillar)) problems.push(`${id}: pillar "${e.fields.Pillar}" not one of ${PILLARS.join('/')}`);
    if (e.fields['Expected lift'] && !/^\+?\d+(\.\d+)?\s*[-–—]\s*\d+(\.\d+)?\s*%$/.test(e.fields['Expected lift'])) problems.push(`${id}: expected lift "${e.fields['Expected lift']}" not +X-Y%`);
    if (e.fields.Confidence && !/^\d{1,3}\s*%$/.test(e.fields.Confidence)) problems.push(`${id}: confidence "${e.fields.Confidence}" not NN%`);
  }
  return problems.length
    ? { ...Fail(problems.slice(0, 6).join('; ') + (problems.length > 6 ? ` (+${problems.length - 6} more)` : '')), critical: true }
    : { ...Pass('every experiment carries the full schema'), critical: true };
}

function checkPillarCoverage(counts) {
  const missing = PILLARS.filter((p) => !counts[p]);
  return missing.length
    ? { ...Fail(`no experiment in: ${missing.join(', ')}`), critical: true }
    : { ...Pass('all five pillars represented'), critical: true };
}

function checkPillarBalance(counts) {
  const over = Object.entries(counts).filter(([, n]) => n > 3);
  return over.length
    ? { ...Warn(`${over.map(([p, n]) => `${p} has ${n}`).join(', ')} (max 3)`), critical: false }
    : { ...Pass('no pillar exceeds 3'), critical: false };
}

function checkCompetitors(rows) {
  const data = rows.slice(1); // drop header row
  const withDomain = data.filter((r) => r.some((c) => /[a-z0-9-]+\.[a-z]{2,}/i.test(c)));
  if (data.length < 3 || data.length > 4) return { ...Fail(`competitor table has ${data.length} rows, expected 3-4`), critical: true };
  return withDomain.length >= 3
    ? { ...Pass(`${data.length} competitors with domains`), critical: true }
    : { ...Warn(`${data.length} rows but only ${withDomain.length} carry a domain`), critical: false };
}

function checkGrounding(experiments, manifest, crawlDir) {
  if (!manifest || !Array.isArray(manifest.surfaces)) return { ...Skip('no manifest; grounding not checked'), critical: true };
  const ungrounded = [];
  for (const e of experiments) {
    const cite = citedArtifact(e.fields.Evidence);
    if (!groundsIn(cite, manifest, crawlDir)) ungrounded.push(`${e.id || e.idRaw}: ${cite || 'no evidence'}`);
  }
  return ungrounded.length
    ? { ...Fail(`evidence not in the manifest: ${ungrounded.slice(0, 5).join('; ')}${ungrounded.length > 5 ? ` (+${ungrounded.length - 5})` : ''}`), critical: true }
    : { ...Pass('every experiment cites a captured artifact'), critical: true };
}

function checkTechFidelity(techRows, manifest) {
  if (!manifest || !manifest.tech) return { ...Skip('no manifest; tech fidelity not checked'), critical: true };
  const data = techRows.slice(1); // drop header
  const mism = [];
  let compared = 0;
  for (const [check, status] of data) {
    const truth = manifest.tech[check];
    if (!truth) continue;
    compared++;
    if (truth.status.toLowerCase() !== (status || '').toLowerCase()) mism.push(`${check}: report "${status}" vs manifest "${truth.status}"`);
  }
  if (!compared) return { ...Warn('no report tech checks matched the manifest by name'), critical: false };
  return mism.length
    ? { ...Fail(`fabricated status: ${mism.slice(0, 5).join('; ')}${mism.length > 5 ? ` (+${mism.length - 5})` : ''}`), critical: true }
    : { ...Pass(`${compared} tech checks match the manifest`), critical: true };
}

function checkGeneralization(md, host) {
  const leaks = [];
  if (/\b(example\.com|lorem ipsum|TODO|FIXME|placeholder)\b/i.test(md)) leaks.push('template placeholder');
  if (/<[a-z_]+>|\{\{[^}]+\}\}/.test(md)) leaks.push('unfilled template token');
  return leaks.length
    ? { ...Warn(`possible non-generalized content: ${leaks.join(', ')}`), critical: false }
    : { ...Pass('no template leakage'), critical: false };
}

function checkProse(sections) {
  const exec = sections['executive summary']?.body || '';
  const comp = sections['competitor analysis']?.body || '';
  const prose = `${exec}\n${comp.split('\n').filter((l) => !l.trim().startsWith('|')).join('\n')}`;
  const tells = [];
  const llm = [...prose.matchAll(LLM_WORDS)].map((m) => m[0]);
  if (llm.length) tells.push(`LLM words: ${[...new Set(llm.map((w) => w.toLowerCase()))].join(', ')}`);
  const throat = [...prose.matchAll(THROAT)].map((m) => m[0]);
  if (throat.length) tells.push(`throat-clearing: ${[...new Set(throat.map((w) => w.toLowerCase()))].join(', ')}`);
  const dashes = (exec.match(/—/g) || []).length;
  if (dashes > 4) tells.push(`${dashes} em-dashes in the summary`);
  if (/^\s*([-*]|\d+\.)\s+/m.test(exec)) tells.push('executive summary uses a list');
  return tells.length ? { ...Warn(tells.join('; ')), critical: false } : { ...Pass('clean of the usual tells'), critical: false };
}

// ---------------------------------------------------------------- main

function main() {
  const argv = process.argv.slice(2);
  let reportPath = null;
  let manifestArg = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--manifest') manifestArg = argv[++i];
    else reportPath = argv[i];
  }
  if (!reportPath) {
    console.error('usage: node eval/grade.mjs <report.md> [--manifest <path>]');
    process.exit(2);
  }
  if (!existsSync(reportPath)) {
    console.error(`report not found: ${reportPath}`);
    process.exit(2);
  }

  const md = readFileSync(reportPath, 'utf8').replace(/\r\n/g, '\n');
  const sections = splitSections(md);
  const experiments = parseExperiments(sections['proposed experiments']?.body);
  const techRows = parseTable(sections['technical checks']?.body);
  const compRows = parseTable(sections['competitor analysis']?.body);

  const counts = Object.fromEntries(PILLARS.map((p) => [p, 0]));
  for (const e of experiments) if (counts[e.fields.Pillar] !== undefined) counts[e.fields.Pillar]++;

  // Resolve the manifest: explicit flag, else next to the report.
  let manifest = null;
  let crawlDir = null;
  let manifestPath = manifestArg;
  if (!manifestPath) {
    const sibling = join(dirname(reportPath), 'crawl', 'manifest.json');
    if (existsSync(sibling)) manifestPath = sibling;
  }
  if (manifestPath && existsSync(manifestPath)) {
    try { manifest = JSON.parse(readFileSync(manifestPath, 'utf8')); crawlDir = dirname(manifestPath); }
    catch { manifest = null; }
  }
  const host = manifest?.host || (md.match(/https?:\/\/([^/\s)]+)/)?.[1]) || 'unknown';

  const checks = [
    { key: 'structure', label: 'Structure', ...checkStructure(sections) },
    { key: 'experiments', label: 'Experiment count', ...checkCount(experiments) },
    { key: 'schema', label: 'Experiment schema', ...checkSchema(experiments) },
    { key: 'pillar-coverage', label: 'Pillar coverage', ...checkPillarCoverage(counts) },
    { key: 'pillar-balance', label: 'Pillar balance', ...checkPillarBalance(counts) },
    { key: 'competitors', label: 'Competitors', ...checkCompetitors(compRows) },
    { key: 'grounding', label: 'Citation grounding', ...checkGrounding(experiments, manifest, crawlDir) },
    { key: 'tech-fidelity', label: 'Tech-check fidelity', ...checkTechFidelity(techRows, manifest) },
    { key: 'generalization', label: 'Generalization', ...checkGeneralization(md, host) },
    { key: 'prose', label: 'Prose hygiene', ...checkProse(sections) },
  ];

  // Score: Pass full, Warn half, Fail zero, Skip excluded. Gate: no critical Fail.
  const weight = { Pass: 1, Warn: 0.5, Fail: 0, Skip: 0 };
  const scored = checks.filter((c) => c.status !== 'Skip');
  const score = Math.round((scored.reduce((s, c) => s + weight[c.status], 0) / scored.length) * 100);
  const gate = checks.every((c) => !(c.critical && c.status === 'Fail')) ? 'pass' : 'fail';

  const mark = { Pass: 'PASS', Warn: 'WARN', Fail: 'FAIL', Skip: 'SKIP' };
  console.log(`\nGrading ${reportPath}`);
  console.log(`Store: ${host}   Manifest: ${manifestPath || 'none'}\n`);
  for (const c of checks) console.log(`  ${mark[c.status]}  ${c.label.padEnd(20)} ${c.detail}`);
  console.log(`\nScore: ${score}/100   Gate: ${gate.toUpperCase()}`);

  const evalOut = {
    report: reportPath,
    host,
    manifest: manifestPath || null,
    score,
    gate,
    pillars: counts,
    experiments: experiments.map((e) => ({ id: e.id, pillar: e.fields.Pillar, title: e.title })),
    checks: checks.map(({ key, label, status, critical, detail }) => ({ key, label, status, critical, detail })),
    judged: null,
  };
  const outPath = join(dirname(reportPath), 'eval.json');
  writeFileSync(outPath, JSON.stringify(evalOut, null, 2));
  console.log(`wrote ${outPath}\n`);

  process.exit(gate === 'pass' ? 0 : 1);
}

main();
