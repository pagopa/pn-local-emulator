# 1. Where to publish the container image

Date: 2022-09-07

## Status

Proposed

## Context

This project is packaged as a container image. Choose the container registry where deliver the image.

### Option 1

Publish the image to [GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages).

- Cost: The repository is public, so the GitHub Packages is [Free](https://docs.github.com/en/billing/managing-billing-for-github-packages/about-billing-for-github-packages#about-billing-for-github-packages).
- Effort: GitHub Packages is fully integrated with GitHub.
- Limits: There are no know limits about GitHub Packages.

### Option 2

Publish the image to [Docker Hub](https://hub.docker.com/).

- Cost: The repository is public, so Docker Hub is [Free](https://www.docker.com/pricing/).
- Effort: Docker Hub requires to set username and password as [secrets](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images#publishing-images-to-docker-hub).
- Limits: 
  - Limited [*Image Pull Rate*](https://www.docker.com/pricing/)
    - Anonymous Users: 100 pulls per 6 hours.
    - Authenticated users: 200 pulls per 6 hours.

## Decision

We decided for **[Option 1](#option-1)** because it is simpler to use in GitHub and has no limits. 
