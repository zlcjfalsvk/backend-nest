---
description: Analyze and refactor code for better quality and maintainability
---

You are helping the user refactor code following the project's coding standards and best practices.

## Task

Refactor the code at the specified path: `$ARGUMENTS` (default: project root if not specified)

### Steps

1. **Analyze the target path**
   - If path is a file: analyze that specific file
   - If path is a directory: analyze all TypeScript files in that directory
   - If no path provided: analyze the entire project structure

2. **Identify refactoring opportunities**
   - Code duplication
   - Long methods/functions that should be split
   - Complex conditional logic that can be simplified
   - Missing type annotations
   - Inconsistent naming conventions
   - Unused imports or variables
   - Opportunities for better abstraction
   - Violation of SOLID principles
   - Performance improvements

3. **Review existing patterns**
   - Read [Architecture documentation](../docs/ARCHITECTURE.md) for design patterns
   - Read relevant layer documentation based on the target:
     - Business logic: [BUSINESS.md](../docs/libs/BUSINESS.md)
     - Infrastructure: [INFRASTRUCTURE.md](../docs/libs/INFRASTRUCTURE.md)
     - Adapters: [ADAPTER.md](../docs/libs/ADAPTER.md)
     - Utilities: [UTILS.md](../docs/libs/UTILS.md)
     - REST API: [API.md](../docs/apps/API.md)
     - tRPC: [TRPC.md](../docs/apps/TRPC.md)

4. **Propose refactoring plan**
   - List all identified issues with file locations
   - Prioritize by impact (high/medium/low)
   - Explain the benefit of each refactoring
   - Get user approval before proceeding

5. **Execute refactoring**
   - Apply changes incrementally
   - Maintain existing functionality
   - Follow project conventions and patterns
   - Keep changes focused and minimal

6. **Post-refactoring**
   - Run Prettier: `npx prettier --write <files>`
   - Run ESLint: `npx eslint --fix <files>`
   - Verify no type errors: `npx tsc --noEmit`

## Important Notes

- Always analyze before changing - understand the code first
- Preserve existing behavior - refactoring should not change functionality
- Make incremental changes - one logical change at a time
- Follow project patterns defined in documentation
- Do NOT over-engineer - keep solutions simple
- Do NOT add features during refactoring - focus only on code quality
- Ask for confirmation before making significant structural changes

## Examples

- `/refactoring` - Analyze entire project
- `/refactoring libs/business/src/auth` - Refactor auth service
- `/refactoring apps/api/src/posts/posts.controller.ts` - Refactor specific file
