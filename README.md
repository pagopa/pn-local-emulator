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

## Run with Docker

The repository comes with a Dockerfile that you can use to run the application with Docker.
First, build the image:

``` sh
docker build -t pnemulator .
```

Then, run the application:

``` sh
docker run -p 3000:3000 pnemulator
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

curl --request PUT 'http://localhost:8080/uploadS3/use-the-key-taken-from-preload' \
--header 'x-amz-meta-secret: put-here-the-secret-taken-from-preload' \
--header 'x-amz-checksum-sha256: jezIVxlG1M1woCSUngM6KipUN3/a8cG5RMIPnuEanlE='

curl --location --request GET 'localhost:8080/checklistresult'

curl --request POST 'http://localhost:8080/delivery-progresses/streams' \
  --header 'x-api-key: key-value' \
  --header 'Content-Type: application/json' \
  --data-raw '{
  "title": "string",
  "eventType": "STATUS",
  "filterValues": [
    "string"
  ]
}'
```
