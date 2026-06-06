# Golden regression cases

Frozen fixtures that `eval/grade.mjs` is tested against. They do not come from a live
crawl and must not be regenerated from one, because the whole point is that the grader's
behavior is pinned to inputs that never move. Live, regenerated audits live under
`sample_output/`; these stay here.

Run the guard:

```
node eval/cases/run.mjs      # or: npm run test:eval
```

It grades every case in a scratch directory, asserts the expected outcome, and exits
non-zero on any mismatch. The `code-reviewer` runs it before a grader change lands.

## What each case pins

- **`gold/`** — a complete, grounded report (`report.md`) and a trimmed manifest
  (`manifest.json`). Every citation resolves against the manifest and the technical-checks
  table matches it, so the report grades green at 100 with **grounding and tech-fidelity both
  Pass**. This is the case that exercises the manifest-gated checks end to end.
- **anchor** — `reference/target_report.anchor.md` graded with no manifest. It must come
  back green at 100 with grounding and tech-fidelity **Skip**, which pins the manifest-optional
  path and the recalibrated pillar balance (the anchor runs Conversion ×4).
- **broken variants** — the runner derives four one-defect copies of the gold report, each
  meant to flip a different critical check and the gate: a citation pointed at an artifact
  absent from the manifest (grounding), a tech status flipped away from the manifest
  (tech-fidelity), an experiment removed (count), and a pillar emptied (coverage).

## The manifest has no PNGs on purpose

`grade.mjs` grounds a citation when its basename matches `basename(manifest.surfaces[].screenshot)`,
so the fixture only needs surfaces whose screenshot paths share a basename with the report's
citations, plus a couple of real URLs for the URL-cited experiments. No image files required.

## Editing the fixtures

The broken variants are string mutations in `run.mjs` keyed to unique anchors in `gold/report.md`
(a specific screenshot basename, the `| Favicon | Pass |` row, the last experiment's id, the lone
Performance pillar). If you edit the gold report, keep those anchors or update the mutations; the
runner's "mutation changed the report" assertion fails loudly if a defect silently becomes a no-op.
