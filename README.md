# PnValidator
[![CI](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml)

A system that emulates a subset of the HTTP API provided by Piattaforma Notifiche platform and produces a report containing the coverage of expected use cases.

## How to use
1. Start `PnValidator` as described in the [How to run](#how-to-run) section.
2. Change the configuration of your integration as follows:
   - Change the `x-api-key` to the following value `key-value`,
   - Change the base URL to the `PnValidator` endpoint (depends on how you started it, e.g.: `http://localhost:3000`).
3. Test your integration.
4. Call the endpoint that produces the report showing the use cases coverage. If all the checks are `ok` then your integration covers the expected use cases.
``` shell
# this is an example, the port and the hostname depend on how you started the PnValidator system

curl --location --request GET 'http://localhost:3000/checklistresult'
```

## Which use cases case be tested
At the moment the `PnValidator` allows the following use-case:

### TC-SEND-01
Create a `NotificationRequest` providing two documents: the act to notify and the pagoPA payment.

1. Request two upload slot
2. Consume the two upload slots uploading two documents (use the information provided in the previous request).
3. Create a notification request providing the following information:
   - `physicalCommunicationType` filled with `REGISTERED_LETTER_890` value
   - the `recipients` field providing:
      - `taxId`
      - `digitalDomicile`
      - `physicalAddress`
      - `payment` referencing one file uploaded previously
   - the `documents` field providing one file uploaded previously


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
