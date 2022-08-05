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

### Example

``` sh
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
