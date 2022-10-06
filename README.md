# PnValidator
[![CI](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml)

A system that emulates some features of the Piattaforma Notifiche platform.

## Prerequisites
If you want to run the emulator locally, starting from the source code, you need to follow the next steps.

The first thing to do is to clone the repository using the preferred method (the next command uses SSH):

```shell
git clone git@github.com:pagopa/pn-local-emulator.git
```

This project runs using [Node.js](https://nodejs.org/en/) and it has been developed with the version specified in the [`.node_version`](.node-version) file.

You could [install nvm](https://github.com/nvm-sh/nvm) and use the next commands to install and set the same version
of Node.js specified in the `.node_version` file.

```shell
# Install the version of Node.js specified in the .node_version file
nvm install `cat .node-version`

# Set the version of Node.js specified in the .node_version file
nvm use `cat .node-version`
```
Make sure that the path of `.node_version` is correct because the example commands assume you are in the repository folder.

## How to run

### Run using Node.js

Install the dependencies.

```shell
npm install
```

Generates code from the [OpenAPI](./openapi/index.yaml) specification.

```shell
npm run generate
```

Start the application.

```shell
npm run start
```

### Run using Docker (Dockerfile)

The repository comes with a Dockerfile that you can use to run the application with Docker.

Build the image.

```shell
docker build -t pnemulator .
```

Run the emulator.

```shell
docker run -p 3000:3000 pnemulator
```
The [Dockerfile](./Dockerfile) exposes port `3000` of the container, so you can use the `-p` option to map it to a port of your choice.

### Run using the public container image

Another option is to run the container image available in the container registry.

Pull the image from the container registry.

```shell
docker pull ghcr.io/pagopa/pn-local-emulator:latest
```

Run the application.


```shell
docker run -p 3000:3000 ghcr.io/pagopa/pn-local-emulator:latest
```
