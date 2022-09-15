# PnValidator 
[![CI](https://github.com/pagopa/pn-local-emulator-poc/actions/workflows/ci.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator-poc/actions/workflows/ci.yaml)

A system that emulates some features of Piattaforma Notifiche platform.

## Prerequisites
The first thing to do is to clone the repository using the preferred method (the next command uses SSH):

```shell
git@github.com:pagopa/pn-local-emulator-poc.git
```

This project runs using [Node.js](https://nodejs.org/en/). It is possible to see the version of Node.js used in the [`.node_version`](.node-version) file.
You should download the version specified in that file to be sure to have the same environment as the one used by the developers.

A fancy tool that can help you to manage multiple versions of Node.js is [nvm](https://github.com/nvm-sh/nvm).
In case you want to use it, after installing it, you can run the following command to install the correct version of Node.js:

```shell
nvm install `cat .node-version`
```
and after the installation has been completed, run the following command to make sure you are using the proper version of Node.js:

```shell
nvm use `cat .node-version`
```
Make sure that the path of `.node_version` is correct, because the example commands assumes you are in the repository folder.

## How to run

### Run using Node.js

Before running the project, you should install the dependencies using the following command:

```shell
npm install
```

After that, the project requires some code that is going to be generated starting from the [OpenAPI](./openapi/index.yaml) specification.  
You can accomplish that by running:

```shell
npm run generate
```

Now, you are ready to run the project using the following command:

```shell
# start the application
npm run start
```

### Run using Docker (Dockerfile)

The repository comes with a Dockerfile that you can use to run the application with Docker.
First, build the image:

```shell
docker build -t pnemulator .
```

Then, run the application:

```shell
docker run -p 3000:3000 pnemulator
```
The [Dockerfile](./Dockerfile) exposes the port `3000` of the container, so you can use the `-p` option to map it to a port of your choice.

### Run using the public container image

Another option is to run the container image availeble in the container registry.
First, pull the image:

```shell
docker pull ghcr.io/pagopa/pn-local-emulator-poc:latest
```

Then, run the application:

```shell
docker run -p 3000:3000 ghcr.io/pagopa/pn-local-emulator-poc:latest
```

## Examples

```shell
# Get the report, initially it shows all 'ko'
curl --location --request GET 'localhost:8080/checklistresult'

# Require an upload slot
curl --request POST 'http://localhost:8080/delivery/attachments/preload' \
--header 'x-api-key: key-value' \
--header 'Content-Type: application/json' \
--data-raw '[
    {
        "preloadIdx": "1",
        "contentType": "application/pdf",
        "sha256": "jezIVxlG1M1woCSUngM6KipUN3/a8cG5RMIPnuEanlE="
    },
    {
        "preloadIdx": "2",
        "contentType": "application/pdf",
        "sha256": "jezIVxlG1M1woCSUngM6KipUN3/a8cG5RMIPnuEanlE="
    }
]'

# Get the report, as you can see some result are 'ok'
curl --location --request GET 'localhost:8080/checklistresult'
```
