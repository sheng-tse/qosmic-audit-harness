# How the eval becomes autonomous

The runtime that writes an audit is thin and nearly done. The eval is where the value compounds,
because the hard part is grading audits well with no fixed answer key, and needing less human
oversight each month. This is the plan, one loop that tightens over time.

## Two layers, cheap first

Every audit is scored twice. `eval/grade.mjs` is the deterministic gate. It checks structure, the
ten-experiment schema, pillar coverage, citation grounding, and tech-check fidelity against the
store's own crawl manifest, then exits non-zero below the gate. It is fast and free, and it catches
every error a machine can be sure about. On top of it sits the judged pass, J1 to J5 in
`eval/rubric.md`. The five cover evidence soundness, actionability, prioritization, competitor
realism, and executive insight, the things a script cannot see. A report that clears the gate but
scores low on J1 or J5 is well-formed and substantively weak, the most useful verdict the eval can
return.

## The promotion loop

The judge is the expensive layer, so the loop's job is to shrink it. When a judged failure recurs
across audits, it gets promoted into a deterministic check in `grade.mjs` and stops needing the
model. A fabricated number the judge keeps catching becomes a manifest cross-check. A recurring
"no reviews on the product page" becomes a grep. `eval/cases/` freezes each promotion as a
regression fixture, so a check that earned its place never silently breaks. The cheap layer grows
toward everything that is actually objective, and the model is left with the genuinely ambiguous.

## The three-month picture

This is the next stretch of `ROADMAP.md`, not a wish. The first month is Phase 2. The judge runs on
every audit and its scores land in `eval.json`, a small set of human-rated audits tunes it until
its ranking matches theirs, grounding moves from file-existence to claim-support, and the failures
the judge keeps flagging harden into deterministic checks. By month three a human no longer reads
every audit. The judge scores, only the audits where it disagrees with the gate or flags low
confidence reach a person, and each correction that person makes does one of two things. It retunes
the judge, or it becomes a new check. Both shrink the next queue, so the share of audits a human
touches falls month over month instead of holding flat. CI grades every push, and real Lighthouse
and Core Web Vitals replace the unmeasured page-speed warns. The harder goal sits a year out, not a
quarter, and it is the one below.

## Grading on outcomes, not looks

The end state is grading audits on whether they made the store money. Experiments already carry
stable ids. When a shipped experiment's result comes back, it flows in against that id, and
confidence is recalibrated against realized lift instead of the writer's guess. A red-team agent
that writes audits built to pass every check while being wrong keeps the gate honest. At that point
the eval is no longer scoring whether an audit looks right. It is scoring whether it was.
