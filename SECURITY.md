# Security Policy

TokenPress is local-first tooling for terminal transcripts. It should never require credentials, network access, or private services to run.

## Supported versions

Security fixes target the current `main` branch until the first tagged release. After `v1.0.0`, supported ranges will be listed here.

## Reporting a vulnerability

Please open a private GitHub security advisory for `rogerchappel/tokenpress`, or contact the maintainer through GitHub if advisories are unavailable.

Include:

- TokenPress version or commit SHA
- Operating system and Node.js version
- Minimal local transcript that reproduces the issue
- Whether secrets were exposed despite default redaction

## Security boundaries

- No telemetry or hidden network calls.
- No execution of commands found inside transcripts.
- No recursive filesystem scan unless explicitly added in a future reviewed release.
- Default redaction for common token, API key, password, authorization, and email patterns.

`--no-redact` disables redaction and should only be used for private local debugging.
