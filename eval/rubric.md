# Audit eval rubric

How a Qosmic audit is scored. Two layers, cheap first: a deterministic gate a script
runs every time, then a judged pass for what a script cannot see. `grade.mjs` implements
the gate; the judged scores are written back into the same `eval.json` under `judged`.

## Deterministic gate (`grade.mjs`)

Each check is Pass, Warn, Fail, or Skip. **Critical** checks gate: one Fail and the report
does not ship, and `grade.mjs` exits non-zero. The rest deduct from the score but do not
block, because they flag weakness a human can overrule. Grounding and tech fidelity Skip
when no crawl manifest is on hand, so the gate still runs on structure and schema alone.

| Check | Gates | Pass when | Fails / warns when |
|---|---|---|---|
| Structure | yes | the four sections (Executive summary, Proposed experiments, Competitor analysis, Technical checks) are present and in order | a section is missing or out of order |
| Experiment count | yes | exactly 10 experiments | any other count |
| Experiment schema | yes | every experiment has a valid `exp-<12 hex>` id and all ten labeled fields, with `Expected lift` as `+X-Y%`, `Confidence` as `NN%`, and a real pillar | any field missing or malformed |
| Pillar coverage | yes | all five pillars appear | a pillar has no experiment |
| Pillar balance | no | no single pillar holds half the experiments | one pillar holds half or more, 5+ of 10 (warn) |
| Competitors | yes | the table carries 3-4 rows with domains | wrong row count (fail) or rows without domains (warn) |
| Citation grounding | yes | every experiment's `Evidence` resolves to a screenshot or URL in the manifest | a cited artifact is absent from the manifest |
| Tech-check fidelity | yes | each report tech status matches the manifest's status for that check | a status is changed from what the crawl found |
| Generalization | no | no template tokens or placeholder text | `example.com`, `lorem ipsum`, `<token>`, etc. leak through |
| Prose hygiene | no | the summary and competitor prose are clean of the usual tells | LLM vocabulary, throat-clearing, or a pile of em-dashes show up |

Pillar balance warns only at a true wall: one pillar holding half the experiments or more. A
lean of three or four toward where the leaks are passes clean, which is why the calibration
anchor scores 100 while running four Conversion experiments. Coverage of all five pillars is
the hard rule; whether a given concentration is justified is the J3 judged pass's call, not
the script's.

**Score** is the share of checks earned, Pass full and Warn half, Skip excluded. **Gate**
is independent: it passes only when no critical check failed. A report can score 80 and
still fail the gate on one broken citation, which is the point.

## Judged pass (J1-J5)

What the script cannot see. Score each 0 to 1, with a one-line reason that quotes the part
of the report you read, and write all five into `eval.json` under `judged`. A report that
clears the gate but scores low here is well-formed and substantively weak, the most useful
verdict the eval can return.

- **J1 Evidence soundness** — does each hypothesis actually follow from the artifact it cites,
  or is the screenshot just decoration? Grounding proves the file exists; J1 reads it.
- **J2 Actionability** — could a team build the primary change from the description alone, and
  are the lift and KPI numbers tied to something real rather than invented?
- **J3 Prioritization** — are the biggest revenue leaks the top experiments, or is the order
  arbitrary? The first three should be the three that matter most.
- **J4 Competitor realism** — are the competitors real, in-category, and worth copying, or
  filler names with a generic "what they do better" column?
- **J5 Executive insight** — does the summary name the true biggest leak in plain words, the
  way the anchor names the buy path, or does it hedge across everything at once?

## Calibration

`eval/cases/` holds graded reference audits with expected scores and human notes. Run the
gate against them to catch regressions in `grade.mjs`; compare the judged scores to the notes
to keep the judge honest. When a judged failure keeps recurring, promote it into a
deterministic check here and in `grade.mjs` so it stops needing the model. That promotion
loop is `EVAL_LOOP.md`.
