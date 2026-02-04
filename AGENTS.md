# Agent Operating Guide

This file describes HOW we work (not product specs).
Product requirements belong in docs/ or linked documents.

## Roles
- Architect:
  - clarifies scope, proposes approach, identifies risks, defines acceptance criteria
- Implementer:
  - makes code changes, adds tests/docs, runs commands
- Reviewer:
  - checks correctness, security, maintainability, and CI readiness

## Task intake format
- Use docs/TASK_TEMPLATE.md for requests.
- If task is ambiguous, ask for clarification OR create assumptions explicitly in the PR description.

## PR rules
- No direct push to main.
- PR must include:
  - What / Why
  - How to test
  - Risks + rollback notes
  - Screenshots when UI changes (if applicable)

## Safety & security
- Never commit secrets. Prefer env example files.
- For destructive changes (migration, deletion, permission changes), require explicit confirmation in the task.
- Avoid large dependency additions unless justified.

## Communication style
- Be concrete: commands, file paths, and acceptance criteria.
- Prefer checklists for multi-step tasks.
