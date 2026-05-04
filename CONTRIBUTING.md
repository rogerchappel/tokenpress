# Contributing to TokenPress

Thanks for helping make terminal logs less feral.

## Development setup

```bash
npm install
npm run build
npm test
npm run smoke
```

## Parser changes

Parser behavior must be backed by fixtures. Add or update files under `fixtures/`, then cover the behavior in `tests/`.

Good parser changes preserve:

- the command that ran
- errors and non-zero exits
- relevant paths
- explicit decisions or blockers
- safe redaction defaults

## Pull request checklist

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run smoke`
- [ ] `bash scripts/validate.sh`
- [ ] README/docs updated if the CLI or output changes

## Style

Keep the core deterministic and dependency-light. Prefer small, readable heuristics over clever magic until fixtures prove the need for complexity.
