# DocutestReporter

A Vitest customer reporter that leverages test annotations
to generate documentation.

## DocutestReporter

### Generates markdown files based on the contents of the tests

#### Without using expectations

Tests can be run using Vitest's 'expect'.
However, in that case, the expectations won't be recorded
as additional documentation.

- Generates the expected document without expectations

#### Using expectations

Users can leverage the 'annooateTest' function
to generate an extended 'expect' that will track expectations as 'expect' is called.

- Generates the expected document with expectations