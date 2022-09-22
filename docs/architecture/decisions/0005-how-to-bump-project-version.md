# 5. How to bump project version

Date: 2022-09-16

## Status

Proposed

## Context

We need to update project's version when we have to release a new version.

### Option 1

Update manually all the files that contain the version (e.g. `package.json`, `package-lock.json`).

### Option 2

Use the [`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version) command and enforce the Git commit message 
by setting the [`message`](https://docs.npmjs.com/cli/v8/using-npm/config#message) parameter to `"Release version %s"` 
in the `.npmrc` file.

## Decision

We decided for **[Option 2](#option-2)** because it is easier to use and give less space to errors.  
