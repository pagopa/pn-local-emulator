# PnValidator
[![CI](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml)

A system that emulates a subset of the HTTP API provided by Piattaforma Notifiche platform, driven by well-defined use cases, and produces a report describing their coverage and correctness.

## How to use

1. Start the `PnValidator` as described in the [How to run](#how-to-run) section.
2. Configure your integration as follows:
   - Set the `x-api-key` to `key-value`,
   - Point your base URL to the `PnValidator` (it depends on how you started it, e.g.: `http://localhost:3000`).

3. Test your integration.
4. Call the `/checklistresult` endpoint that reports the use cases coverage and status.
If all the checks are `ok` then your integration covers the expected use cases.

 ``` shell
# this is an example, the port and the hostname depend on how you started the PnValidator system
curl --location --request GET 'http://localhost:3000/checklistresult'
```

## Testable use cases
Currently, the `PnValidator` allows the emulation and testing of the use cases described down below. As the development proceeds, the list will expand.

### TC-SEND-01
Create a `NotificationRequest` providing two documents, the act to be notified and the pagoPA payment.

1. Request two upload slots.
2. Upload the two documents, act and payment, using the returned slots.
3. Create a notification request carrying the following information:
   - `physicalCommunicationType` filled with `REGISTERED_LETTER_890` value
   - the `recipients` field containing:
      - `taxId`
      - `digitalDomicile`
      - `physicalAddress`
      - `payment` referencing the payment file previously uploaded
   - the `documents` field providing the act file previously uploaded

### TC-SEND-01bis
Create a `NotificationRequest` providing the act to be notified only (no payments are involved).

1. Request an upload slot.
2. Upload the act document using the returned slot.
3. Create a notification request carrying the following information:
    - `physicalCommunicationType` filled with `REGISTERED_LETTER_890` value
    - the `recipients` field containing:
        - `taxId`
        - `digitalDomicile`
        - `physicalAddress`
    - the `documents` field providing the act file previously uploaded

### TC-SEND-02
Create an `EventStream` and consume it until the stream provides one or more notifications with a predefined status.

1. Complete `TC-SEND-01` or `TC-SEND-01bis` use cases with success.
2. Create a new `EventStream` with the `eventType` set to `TIMELINE`.
3. Consume the `EventStream` multiple times until all the conditions are met.
   - The conditions to be met are described in the endpoint that reports the use cases coverage (check [How to use](#how-to-use) section for more information).

## How to run
We provide a couple of different ways to start the `PnValidator`:

- from the source code
- as a [Docker](https://docker.com) image

### Run from the source code

This section describes how to start the `PnValidator` from the source code.

Since this project runs with [Node.js](https://nodejs.org/en/) as specified in the [`.node_version`](.node-version) file, we strongly encourage [using nvm](https://github.com/nvm-sh/nvm).

Here is what you need to do:

1. Clone the repository using the preferred method (the next command uses SSH):
```shell
git clone git@github.com:pagopa/pn-local-emulator.git
```

2. (Optional but strongly recommended) Install the Node.js runtime using `nvm` (please, make sure the path of `.node_version` is correct. The given commands assume you are in the repository folder.).
```shell
# Install the version of Node.js specified in the .node_version file
nvm install `cat .node-version`

 # Set the version of Node.js specified in the .node_version file
nvm use `cat .node-version`
```

3. Install the dependencies.
```shell
npm install
```

4. Generate code from the [OpenAPI](./openapi/index.yaml) specification.
```shell
npm run generate
```

5. Start the `PnValidator`.
```shell
npm run start
```

### Run as a Docker image

Another option is to run the `PnValidator` with Docker.

These are the steps:

1. Download the latest image version of the tool from the registry.
```shell
docker pull ghcr.io/pagopa/pn-local-emulator:latest
```

2. Start the container.
```shell
docker run -p 3000:3000 ghcr.io/pagopa/pn-local-emulator:latest
```

> Hint: The Docker image exposes the port 3000 of the container, so you can use the -p option to map it to a port of your choice.

## More advanced stuff

### Build and run your local Docker image from the source code

The repository comes with a Dockerfile that you can use to run the `PnValidator` with Docker.

1. Build the image.

 ```shell
docker build -t pnemulator .
```

2. Run the `PnValidator`.

 ```shell
docker run -p 3000:3000 pnemulator
```

> Hint: The [Dockerfile](./Dockerfile) exposes the port `3000` of the container, so you can use the `-p` option to map it to a port of your choice.

### ADDITIONAL NOTES
When you upload a document, the max allowed size of that document is 5MB. 
