---
applyTo: 'front-app/*'
---

## Instructions for Copilot Agent Mode:
- Before building, always run `npx prettier --write` to format the code.
- Use Server Actions for data mutations (NOT API Routes unless external API integration needed)
- All imports should use `@/` alias for clean paths
- Always use TypeScript with explicit types