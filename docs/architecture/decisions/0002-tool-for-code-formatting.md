# 2. Which tool use to execute code-formatting

Date: 2022-08-10

## Status

Accepted

## Context

We need a way to trigger the code-formatting before the developer pushes code to the origin.

### Option 1

Use an IDE specific settings (provided with a guideline or a settings pushed on repository).

### Option 2

Use a git hook that runs the code-formatting command before the push and prevent the push if the code isn't formatted.

### Option 3

Like Option 2 but using [husky](https://typicode.github.io/husky/#/).

## Decision

We decided for **[Option 3](#Option 3)**, because it works regardless the IDE used.

## Consequences

To achieve the check on code format we accept to have pre-push hook that format the code.
