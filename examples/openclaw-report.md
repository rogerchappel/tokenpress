# Example workflow

Generate a compact local report from the bundled OpenClaw-style fixture:

```bash
npm run build
node dist/cli.js inspect fixtures/sample --output out
sed -n '1,80p' out/tokenpress.md
```

Use the report as handoff context for another agent, a pull request note, or a debugging journal entry.
