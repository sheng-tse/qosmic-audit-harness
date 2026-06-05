# Writing style

This repo gets read by humans deciding whether to hire. Every word here, in reports, docs, code
comments, and commit messages, should read like a sharp engineer wrote it on a deadline. A
reviewer should not be able to pattern-match the prose to a language model.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org): a type prefix, then an
imperative, lowercase subject with no trailing period.

- Types: `feat:` new capability, `fix:` bug fix, `docs:` docs only, `refactor:` no behavior
  change, `test:` tests, `chore:` tooling and data, with `build:` / `ci:` / `perf:` / `style:`
  as named. Add a scope when it sharpens things: `feat(crawl): ...`.
- Examples: `feat: add playwright crawler`, `fix(crawl): handle cloudflare 403 on cart probe`,
  `docs: write eval loop`, `chore: add sample audits`.
- No AI attribution of any kind. No `Co-Authored-By`, no "Generated with Claude", no tool
  footers, no robot emoji. A reviewer skimming `git log` should see an engineer's history.
- Subject under ~70 chars. Add a body only when the reason isn't obvious from the diff.

## The tells to cut

These patterns read as machine-written. Default to not using them. Reach for one only when it
is genuinely the clearest option on the page.

- Em-dash as connective tissue, the "— and that's the point" reflex. A period, comma, or
  parentheses almost always reads better. One a page is fine; three a paragraph is a tell.
- The colon-explainer header repeated down a page (`**Thing:** explanation`). Write a sentence.
- Antithesis templates: "it's not X, it's Y", "not just X but Y".
- Rule-of-three everywhere: "fast, reliable, and scalable". Real writing has uneven counts.
- Hype adjectives: seamless, robust, powerful, comprehensive, cutting-edge, world-class.
- LLM vocabulary: leverage, delve, tapestry, testament, underscore, elevate, unlock, realm,
  landscape, foster, navigate (figurative), harness (as a verb in prose).
- Throat-clearing: "it's worth noting", "it's important to understand", "at its core".
- Transition scaffolding: Furthermore, Moreover, Additionally, In conclusion, Overall.
- The closing paragraph that restates what you just said.
- Title Case Headings, bold on everything, decorative emoji.

## What to do instead

- Lead with the claim. Cut the wind-up.
- Concrete over abstract. "12 products, median price $5" beats "a limited catalog".
- Vary sentence length. A short one lands.
- Let counts be asymmetric. Two reasons, or four. Not always three.
- Plain verbs: use, build, find, break, ship, cut.
- If a sentence survives deletion, delete it.

## Scope and the one exception

These rules govern free prose: executive summaries, competitor narration, and every `.md` doc
in the repo (`EVAL_LOOP.md`, `AGENT_LOG.md`, `WORKFLOWS.md`, `README.md`, `ROADMAP.md`), plus
commit messages.

The audit report's experiment block is the exception. Its labeled fields (`Pillar`,
`Hypothesis`, `Primary change`, and so on) follow the canonical schema in
`reference/target_report.anchor.md`, which uses bold labels on purpose. That is a required data
format, not prose, so the bold-label pattern stays there. Everywhere else, the rules above hold.
The instruction is "only when necessary," not "never."
