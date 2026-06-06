# How I work with coding agents

Most of my work runs through one setup. Each repo gets a `.claude/` harness, the agent does the
building, I set the rules and the destination. The projects have little in common. An open-source
accelerator compiler (`strata`), a from-scratch Neovim notebook plugin (`jupynvim`), two ML
research projects, this audit harness. The way I delegate to agents holds across all of them. The
driver is Claude Code on Opus, and the real work lives in what I put in the repo rather than what I
type into the chat.

## A harness per repo, not a chat

Every project gets a `CLAUDE.md` that holds the rulebook (priorities, repo orientation, the
conventions that don't bend) and a `ROADMAP.md` that holds the destination (phases and milestones,
each with an observable exit criterion). A `/next` command reads the roadmap and surfaces the first
un-ticked milestone, and nothing gets built until I confirm it. A `/build`-style command then takes
that milestone end to end. In `strata` the rulebook fixes performance parity as priority #1 and the
FFI boundary as load-bearing, which keeps the agent optimizing against a vendor baseline instead of
guessing. A few rules travel between every repo. Conventional Commits, no AI watermark on commits,
stop at the first failing step.

## Subagents are roles, not helpers

I build subagents that hold a role and an epistemic stance, with their tools cut down to fit.
`strata` has a `perf-engineer` that grounds every claim in a profile line and rejects proposals
with no measurement behind them, alongside a `kernel-author`, a `security-auditor`, and a
`code-reviewer`. This harness has a `code-reviewer`, an `audit-reviewer` that checks each claim
against the artifact it cites, and a `competitor-researcher`. The point of all of them is a
reviewer the main loop cannot overrule, so nothing ships on the implementing agent's own say-so.

## Commands compose the pipeline

Slash commands wire the agents and skills into a pipeline with auditable gates. In `strata`,
`/ship-op` runs the kernel-author, then a benchmark, then a code-review, then a security-audit
triage that greps the diff for `unsafe`, FFI, and codegen and either invokes the auditor or records
the skip with the grep result, so the decision lands on the record either way. This harness's
`/audit` and `/build` take the same shape. Skills hold the procedures, agents hold the roles,
commands wire them together.

## Guardrails and memory live in the repo

`settings.json` fixes what the agent may run unattended and what it may not. It allows each
project's toolchain, the cargo and clang and MLIR commands in `strata`, node and Playwright here,
and it denies the destructive ones, force-push and `reset --hard` and `rm -rf`. Long-running
context lives in files rather than the chat. Status snapshots go in `memory/`, a gitignored runbook
holds the cluster env for the GPU research repos, and an `AGENTS.md` sits beside `CLAUDE.md` in
`jupynvim` so a non-Claude agent has an entry point too. Sessions resume clean because the state
sits on disk.

## What I drive vs. what the agent drives

The agent drives implementation and verification, milestone after milestone. I take the wheel on
the calls that are expensive to reverse or need taste. The architecture and priorities that go in
`CLAUDE.md`. The milestone confirmations. The judgment calls, performance as the compiler's first
priority, holding a research eval to matched-budget baselines and ablations rather than one number,
recalibrating the pillar rule here and refusing to ship a thin third audit. The standard stays
constant across all of it, from `jupynvim`'s "no degraded fallbacks as final answers" on down. The
agent does the work, the bar is mine.
