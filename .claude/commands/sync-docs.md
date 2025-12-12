---
description: Synchronize and update all markdown documentation files
---

You are helping the user synchronize documentation with the current codebase state.

## Task

Scan and update all markdown documentation files to ensure they accurately reflect the current codebase.

### Steps

1. **Discover all markdown files**
   - Scan `**/*.md` including `.claude/` directory
   - List all discovered documentation files

2. **Analyze codebase changes**
   - Check current project structure
   - Identify new modules, services, or components
   - Identify removed or renamed files
   - Check for API endpoint changes
   - Check for new DTOs or schemas

3. **Review and update each documentation file**

   For each markdown file, verify and update:

   **Architecture Documentation** (`docs/ARCHITECTURE.md`):
   - Layer structure accuracy
   - Design patterns in use
   - Path aliases
   - Technology stack

   **Library Documentation** (`docs/libs/*.md`):
   - Service methods and signatures
   - Module exports
   - Type definitions
   - Usage examples
   - Dependencies

   **Application Documentation** (`docs/apps/*.md`):
   - API endpoints (paths, methods, request/response)
   - DTOs and validation rules
   - Guards and middleware
   - tRPC procedures and schemas

   **CLAUDE.md** (`.claude/CLAUDE.md`):
   - Command documentation
   - Documentation references
   - Project guidelines

4. **Update process for each file**
   - Read current documentation
   - Compare with actual codebase
   - Identify discrepancies
   - Update outdated sections
   - Add missing information
   - Remove obsolete content

5. **Post-update**
   - Apply Prettier formatting: `npx prettier --write **/*.md`
   - Show summary of changes made

## Important Notes

- Preserve existing documentation style and formatting
- Keep documentation concise and focused
- Update code examples to match current implementation
- Maintain Korean/English consistency as per file conventions
- Do NOT delete documentation for features that still exist
- Add TODO markers for sections that need manual review

## Documentation Files to Check

```
.claude/CLAUDE.md
.claude/commands/*.md
docs/ARCHITECTURE.md
docs/libs/BUSINESS.md
docs/libs/INFRASTRUCTURE.md
docs/libs/ADAPTER.md
docs/libs/UTILS.md
docs/apps/API.md
docs/apps/TRPC.md
README.md
tests/e2e/README.md
```

## Output

Provide a summary report:

- Files scanned
- Files updated (with change descriptions)
- Files unchanged
- Any issues or warnings found
