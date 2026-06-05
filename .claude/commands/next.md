---
description: Read ROADMAP.md, identify the current milestone, and dispatch the command that builds it.
---

Read `ROADMAP.md`. Find the current phase and the first unchecked `- [ ]` milestone, working
top-down. That milestone is the next thing to build.

Decide which command builds it:

- An implementation or docs milestone (a script, the eval, a config file, a doc): `/build`.
- A milestone that is only a roadmap edit (recording a measurement, marking something done):
  no command; a direct edit plus a `docs(roadmap):` commit.

Surface three things to me: the milestone, its exit criterion (the part in italics), and the
command you propose to run. Then wait for my confirmation before building anything.

After the exit criterion is met, tick the box in `ROADMAP.md` in the same commit that satisfies
it. Commit messages follow Conventional Commits per `.claude/STYLE.md`, no AI attribution.

Edge cases:
- If several boxes are unchecked at once because the work is parallel, surface all of them and
  let me pick.
- If the current phase has no unchecked boxes, say the phase is complete and surface the first
  milestone of the next phase.
- If `ROADMAP.md` is missing or empty, that is a project-state error. Report it; do not invent a
  milestone.
