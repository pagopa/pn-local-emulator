# 1. Where to publish the container image

Date: 2022-09-07

## Status

Proposed

## Context

This project is packaged as a container image, we have to allow anonymous users to pull it. Choose the container registry where deliver the image.

### Option 1

Publish the image to [GitHub Packages](https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages).

- Cost: The repository is public, so the GitHub Packages is [Free](https://docs.github.com/en/billing/managing-billing-for-github-packages/about-billing-for-github-packages#about-billing-for-github-packages).
- Effort: GitHub Packages is fully integrated with GitHub.
- Limits: There are no know limits about GitHub Packages.
- Pull from anonymous users: [Allowed](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#:~:text=Public%20images%20allow%20anonymous%20access%20and%20can%20be%20pulled%20without%20authentication%20or%20signing%20in%20via%20the%20CLI.).

### Option 2

Publish the image to [Docker Hub](https://hub.docker.com/).

- Cost: The repository is public, so Docker Hub is [Free](https://www.docker.com/pricing/).
- Effort: Docker Hub requires to set username and password as [secrets](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images#publishing-images-to-docker-hub).
- Limits: 
  - Limited [*Image Pull Rate*](https://www.docker.com/pricing/)
    - Anonymous Users: 100 pulls per 6 hours.
    - Authenticated users: 200 pulls per 6 hours.
- Pull from anonymous users: Allowed but [limited](https://docs.docker.com/docker-hub/download-rate-limit/#:~:text=For%20anonymous%20users%2C%20the%20rate%20limit%20is%20set%20to%20100%20pulls%20per%206%20hours%20per%20IP%20address).

## Decision

We decided for **[Option 1](#option-1)** because it is simpler to use in GitHub and has no limits.
