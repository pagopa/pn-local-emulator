# 5. How to bump project version

Date: 2022-09-16

## Status

Proposed

## Context

We need to update project's version when we have to release a new version.

### Option 1

Update manually all the files that contain the version (e.g. `package.json`, `package-lock.json`).

### Option 2

Use the [`npm version`](https://docs.npmjs.com/cli/v8/commands/npm-version) command.

## Decision

We decided for **[Option 2](#option-2)** because it is easier to use and give less space to errors.  
We also going to set the [`message`](https://docs.npmjs.com/cli/v8/using-npm/config#message) parameter to `"Release v%s"`
in the `.npmrc` file, so we enforce the use of the same Git commit message when using the `npm version` command.

Example:  
assumes the `package.json` has version `1.0.0`

```bash
npm version minor
```
will update the `package.json` and `package-lock.json` version field to `1.1.0` and create a Git tag with the message 
`"Release v1.1.0"`.
