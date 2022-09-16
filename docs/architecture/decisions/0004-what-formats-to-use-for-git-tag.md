# 4. What formats to use for Git tag

Date: 2022-09-16

## Status

Proposed

## Context

We use Git tags to mark project versions and those tags are used to build the container image. 
We need to decide what format to use for those tags. 

### Option 1

Use the same format as the [semver](https://semver.org/) specification.

### Option 2

Use any string as a tag.

## Decision

We decided for **[Option 1](#option-1)** because it is widely used and has many rules that define an order between versions.  
We are going to add the `v` prefix to the Git tag, which is accepted as explained 
[here](https://semver.org/spec/v2.0.0.html#is-v123-a-semantic-version).
