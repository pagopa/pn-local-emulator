# PnValidator
[![CI](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml)

A system that emulates a subset of the HTTP API provided by Piattaforma Notifiche platform and produces a report containing the coverage of expected use cases.

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

## Which use cases case be tested
At the moment the `PnValidator` allows the following use-case:

### TC-SEND-01
Create a `NotificationRequest` providing two documents: the act to notify and the pagoPA payment.

1. Request two upload slots
2. Consume the two upload slots uploading two documents (use the information provided in the previous request).
3. Create a notification request providing the following information:
   - `physicalCommunicationType` filled with `REGISTERED_LETTER_890` value
   - the `recipients` field providing:
      - `taxId`
      - `digitalDomicile`
      - `physicalAddress`
      - `payment` referencing one file uploaded previously
   - the `documents` field providing one file uploaded previously


## How to run

We provide a couple of methods to start the emulator:

- from the source code
- as a [Docker](https://docker.com) image

### Run from the source code

This method describes how to start the Emulator from the source code.

Since this project runs with [Node.js](https://nodejs.org/en/) as specified in the [`.node_version`](.node-version) file, we strongly encourage [using nvm](https://github.com/nvm-sh/nvm).

Here is what you need to do:

1. clone the repository using the preferred method (the next command uses SSH):

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

4. Generates code from the [OpenAPI](./openapi/index.yaml) specification.

 ```shell
npm run generate
```

5. Start the Emulator.

 ```shell
npm run start
```

### Run as a Docker image

Another option is to run the container image already available in the containers registry, as follow:

1. Pull the image from the container registry.

 ```shell
docker pull ghcr.io/pagopa/pn-local-emulator:latest
```

2. Run the application.

 ```shell
docker run -p 3000:3000 ghcr.io/pagopa/pn-local-emulator:latest
```

## More advanced stuff

### Build and run your local Docker image from source code

The repository comes with a Dockerfile that you can use to run the application with Docker.

1. Build the image.

 ```shell
docker build -t pnemulator .
```

2. Run the emulator.

 ```shell
docker run -p 3000:3000 pnemulator
```

The [Dockerfile](./Dockerfile) exposes the port `3000` of the container, so you can use the `-p` option to map it to a port of your choice.
