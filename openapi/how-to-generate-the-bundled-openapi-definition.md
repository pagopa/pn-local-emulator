# How to generate the bundled OpenAPI definition

1. Install `java`
2. Install `swagger-codegen-cli` as below
    1. 
        ```
        cd openapi
        ```
    2. 
        ```
          curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.35/swagger-codegen-cli-3.0.35.jar -O
        ```
    3.  Run the command to generate the 'bundled-api-external-b2b-pa-v2-3.yaml'
          ```
          java -jar swagger-codegen-cli-3.0.35.jar generate -l openapi-yaml -i https://raw.githubusercontent.com/pagopa/pn-delivery/develop/docs/openapi/api-external-b2b-pa-bundle.yaml -o . -DoutputFile=bundled-api-external-b2b-pa-v2-3.yaml
          ```
3. Then do the modification as below to the generated file.
4. Add to the `Problem` and `ProblemError` the `type: object` property
5. Add the following `components.schemas`
    ``` yaml
    # section components.schemas
        PreLoadBulkRequest:
          maxItems: 15
          minItems: 1
          type: array
          items:
            $ref: '#/components/schemas/PreLoadRequest'
    ```
6. Change the `paths.["/delivery/attachments/preload"].post.requestBody`
    ``` yaml
          requestBody:
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/PreLoadBulkRequest'
            required: true
    ```
7. Replace the reference of errors from `#/components/schemas/schemas-ProblemError` to `#/components/schemas/ProblemError`
8. Remove `schemas-ProblemError`.
9. On `NotificationDocument.docIdx` replace `pattern: ^\d+$` with `pattern: ^\\d+$` due to [string pattern definition bug](https://github.com/pagopa/openapi-codegen-ts/tree/v13.0.1#about-string-pattern-definition).
10. Comment or Remove the F24Metadata schema:
    ``` yaml
        F24Metadata:
          type: object
          properties:
            f24Standard:
              nullable: true
              allOf:
              - $ref: '#/components/schemas/F24Standard'
            f24Simplified:
              nullable: true
              allOf:
              - $ref: '#/components/schemas/F24Simplified'
            f24Excise:
              nullable: true
              allOf:
              - $ref: '#/components/schemas/F24Excise'
            f24Elid:
              nullable: true
              allOf:
              - $ref: '#/components/schemas/F24Elid'
          description: "è richiesto uno e uno solo tra le propeties f24Standard, f24Simplified, f24Excise, f24Elid"
    ```
11. Done