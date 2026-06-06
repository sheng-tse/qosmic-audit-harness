# How the eval becomes autonomous

The runtime that writes an audit is thin and nearly done. The eval is where the value compounds,
because the hard part is grading audits well with no fixed answer key, and needing less human
oversight each month. This is the plan for that: one loop that tightens over time.

## Two layers, cheap first

Every audit is scored twice. `eval/grade.mjs` is the deterministic gate. It checks structure, the
ten-experiment schema, pillar coverage, citation grounding, and tech-check fidelity against the
store's own crawl manifest, then exits non-zero below the gate. It is fast and free, and it
catches every error a machine can be sure about. On top of it sits the judged pass, J1 to J5 in
`eval/rubric.md`: evidence soundness, actionability, prioritization, competitor realism, and
executive insight, which is what a script cannot see. A report that clears the gate but scores low
on J1 or J5 is well-formed and substantively weak, the most useful verdict the eval can return.

## The promotion loop

The judge is the expensive layer, so the loop's job is to shrink it. When a judged failure recurs
across audits, it gets promoted into a deterministic check in `grade.mjs` and stops needing the
model. A fabricated number the judge keeps catching becomes a manifest cross-check; a recurring
"no reviews on the product page" becomes a grep. `eval/cases/` freezes each promotion as a
regression fixture, so a check that earned its place never silently breaks. The cheap layer grows
toward everything that is actually objective, and the model is left with the genuinely ambiguous.

## Less human oversight each month

Humans do not review every audit. They review the edge: where the gate and the judge disagree, and
where a judged score sits near a boundary. Those are the cases that teach the judge something. A
seed set of human-rated audits calibrates the judge until its ranking tracks the humans', and
disagreement routing keeps a person in the loop only where the machine is unsure. The month-over-
month goal is fewer routed cases, because the promotion loop keeps turning recurring judgments
into checks.

## Grading on outcomes, not looks

The end state is grading audits on whether they made the store money. Experiments already carry
stable ids; when a shipped experiment's result comes back, it flows in against that id, and
confidence is recalibrated against realized lift instead of the writer's guess. A red-team agent
that writes audits built to pass every check while being wrong keeps the gate honest. At that
point the eval is no longer scoring whether an audit looks right. It is scoring whether it was.
