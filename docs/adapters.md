# Adapters

TokenPress V1 uses small deterministic adapter hints rather than full platform parsers.

- `plain` — generic terminal logs with shell prompts and error text.
- `openclaw` — recognizes OpenClaw-style tool output markers such as `functions.exec` and `Command exited with code`.
- `codex` — recognizes Codex-ish reasoning/apply-patch/test transcript language.
- `auto` — chooses one of the above from the input text.

Adapters are intentionally conservative. If a fixture proves that an adapter should preserve a new signal, add the fixture first, then the heuristic.

All adapters use the same conservative exit-code attribution: explicit `exit code`, `exited code`, and `exited with code` lines apply to the latest detected command. A bare `status` value can describe an HTTP response or application state, so it is never interpreted as a command exit code.
