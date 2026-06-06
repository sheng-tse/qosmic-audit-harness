# How this gets built

The harness is built the way it runs: an agent does the work, a second agent checks it, and a
human steers between milestones. This is the day-to-day loop.

## One milestone at a time

`ROADMAP.md` is the source of what gets built next. `/next` reads it, finds the first unchecked
milestone, and surfaces three things: the milestone, its exit criterion, and the command to run.
Nothing gets built until the human confirms. `/build` then runs the milestone end to end: plan,
implement, hand the diff to the `code-reviewer`, verify the exit criterion by running the actual
command it names, and only then tick the box and commit. A milestone is done because its exit
criterion passed, not because the code looks right. Each commit is one milestone, so the history
reads as the build.

## Two reviewers, no self-certifying

Every change meets a reviewer the author does not get to overrule. The `code-reviewer` reads each
diff for correctness, whether the exit criterion is actually met, and STYLE compliance, and returns
required changes or a sign-off. Every drafted audit meets the `audit-reviewer`, which checks each
claim against the artifact it cites, not just that the file exists. Both have caught real problems:
the crawler reporting a bot-blocking 403 as a broken link, and a sample-store draft that claimed
the store had no shipping threshold when a banner advertised one on every page. Nothing ships on
the agent's own say-so.

## Skills hold the procedure, agents hold the roles

The work is split so context stays small. Skills are procedures the main agent loads when it needs
them: how to crawl a Cloudflare-protected store, how to reason over a manifest, how to write the
report, how to grade it. Agents are roles with their own context and tools: the two reviewers and
the competitor researcher. Commands orchestrate: `/audit` runs the full pipeline, `/eval` scores a
report, `/verify` checks the deliverables. The runtime audit takes the same shape, each pipeline
step writing artifacts to disk so the next step reads files, not one agent's memory.

## Where the human steers

The agent drives the building; the human makes the calls that need judgment. Confirming each
milestone before it runs. Deciding that the pillar-balance rule was stricter than the brief and
should warn only at a true wall, not a justified lean. Killing a thin deliverable rather than
padding it, as with a third sample store that no crawl covered cleanly. Those decisions, and why
they were made, are recorded in `AGENT_LOG.md`, so the history shows where the agent drove and
where it was steered.
