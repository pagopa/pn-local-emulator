# PnValidator
[![CI](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator/actions/workflows/main.yaml)

A system that emulates a subset of the HTTP API provided by Piattaforma Notifiche platform, driven by well-defined use cases, and produces a report describing their coverage and correctness.

## :book: Check out the documentation

If you have to verify your integration, check out the [documentation](https://docs.pagopa.it/pnvalidator/) that describes the steps to run and use the `PnValidator`.

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
When you upload a document, the max allowed size of that document is 100MB. 
