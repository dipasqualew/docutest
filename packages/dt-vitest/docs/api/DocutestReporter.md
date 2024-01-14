---
filename: reporter.test.ts
---

# api/DocutestReporter

A Vitest customer reporter that leverages test annotations
to generate documentation.

## DocutestReporter

### Generates markdown files based on the contents of the tests

#### Using expectations

Users can leverage the 'annotateTest' function
to generate an extended 'expect' that will track expectations as 'expect' is called.

Expectations:
- Does not generate any errors in stderr
- Generates the expected document with expectations
- Contains the filename in the frontmatter

#### Without using expectations

Tests can be run using Vitest's 'expect'.
However, in that case, the expectations won't be recorded
as additional documentation.

Expectations:
- Does not generate any errors in stdrr
- Generates the expected document without expectations
- Contains the filename in the frontmatter