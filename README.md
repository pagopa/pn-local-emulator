# PnValidator [![CI](https://github.com/pagopa/pn-local-emulator-poc/actions/workflows/ci.yaml/badge.svg)](https://github.com/pagopa/pn-local-emulator-poc/actions/workflows/ci.yaml)

A system that emulates some features of Piattaforma Notifiche platform.

## Generate the code

Some code is generated from `openapi/index.yaml` file, the first time and when the content of `openapi/index.yaml` changes you should run the following command:

``` sh
npm run generate
```

## How to run

To run the tool run the following command:

``` sh
# if needed run generate
npm run generate

# start the application
npm run start
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
