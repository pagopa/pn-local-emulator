# PnValidator

A system that emulates some features of Piattaforma Notifiche platform.

## Dependencies

This project requires `pnpm`, follow the installation instruction [here](https://pnpm.io/installation) if your system doesn't have it.

## Generate the code

Some code is generated from `openapi/index.yaml` file, the first time and when the content of `openapi/index.yaml` changes you should run the following command:

``` sh
pnpm generate
```

## How to run

To run the tool run the following command:

``` sh
# if needed run generate
pnpm generate

# start the application
pnpm start
```
