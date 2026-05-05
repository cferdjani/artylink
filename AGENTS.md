<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Session Continuity Rule

- At the end of every working session, update both:
  - `HANDOFF.md`
  - `PROMPT_AGENT_SPRINT_FINAL_PART2.md`
- The update must include:
  - real project state reached in the session
  - files added / modified
  - SQL executed if any
  - validations actually run
  - remaining risks
  - concrete next steps
- Do not leave unverified claims such as "everything is green" without explicit validation.
