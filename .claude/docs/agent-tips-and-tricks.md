# Agent tips and tricks

This is the mandatory entry point for cross-agent CLI operations. The source
repository, web3-ethereum-defi, calls its corresponding guide
`agent-tricks-and-troubleshooting.md`; it does not contain a file named
`agent-tips-and-tricks.md`. The detailed guide in this directory carries that
guidance forward.

Before any Grok, Claude or Codex CLI cross-agent operation — including a
review, sanity check or one-off prompt — read this file and then the detailed
guide at [agent-tricks-and-troubleshooting.md](agent-tricks-and-troubleshooting.md)
in the current session.

For reviews, use read-only tools, do not permit edits, and allow at least 15
minutes before treating a non-trivial agent run as timed out. Grok reviews use
headless `grok -p` mode with `--permission-mode dontAsk`, explicit read-only
tool permissions, `--no-subagents`, and `--no-memory`. Claude and Codex review
commands must follow their detailed streaming instructions in the linked guide.
