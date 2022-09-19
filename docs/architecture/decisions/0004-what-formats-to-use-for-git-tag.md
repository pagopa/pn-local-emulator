# 4. What formats to use for Git tag

Date: 2022-09-16

## Status

Proposed

## Context

We use Git tags to mark project versions and those tags are used to build the container image. 
We need to decide what format to use for those tags. 

### Option 1

Use the [semver](https://semver.org/) specification (e.g.: `1.0.0-alpha+001`).

### Option 2

Use the [semver](https://semver.org/) specification with the prefix `v` (e.g.: `v1.0.0-alpha+001`), as specified 
[here](https://semver.org/#is-v123-a-semantic-version), even if it doesn't produce a semantic version 

## Decision

We decided for **[Option 1](#option-1)** because it is widely used and has many rules that define an order between 
versions.
