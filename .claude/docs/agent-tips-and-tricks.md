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

For reviews, use read-only tools and do not permit edits. Grok reviews use
headless `grok -p` mode with `--permission-mode dontAsk`, explicit read-only
tool permissions, `--no-subagents`, and `--no-memory`. Claude and Codex review
commands must follow their detailed streaming instructions in the linked guide.

## Running and timing out a CLI agent

Three rules apply to every Grok, Claude or Codex CLI run, review or otherwise:

1. **Stream to a file and monitor the stream.** Always use the CLI's streaming
   JSON output (`grok … --output-format streaming-json`,
   `claude -p … --output-format stream-json --verbose`, `codex exec --json`)
   redirected to a raw file, run in the background. Progress is the file
   growing — new `tool_call` / `thought` / `text` events — not the final
   answer. Never pipe through `tail`/`head` (they buffer) and never judge a run
   by its exit or by an empty terminal.
2. **Time out on inactivity, not on elapsed time.** A run is hung only when its
   output file has not grown for **15 minutes**. A run that is still emitting
   events is working, however long it has been going; do not kill it.
3. **Hard cap at 45 minutes.** Wrap the process in `timeout 2700`. If it is
   killed by the cap, salvage what is in the stream (findings are often
   present in `thought` events) and re-run with a tighter tool-call budget or a
   narrower prompt.

The detailed guide has the watcher loop and the per-CLI commands under
"Streaming, monitoring and timeouts".
