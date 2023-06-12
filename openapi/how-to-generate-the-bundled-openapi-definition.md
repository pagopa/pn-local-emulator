# How to generate the bundled OpenAPI definition

1. Install `java` and the `swagger-codegen-cli`
2. Run the command to generate using the language `openapi-yaml`
3. Add to the `Problem` and `ProblemError` the `type: object` property
4. Add the following `components.schemas`
``` yaml
# section components.schemas
    PreLoadBulkRequest:
      maxItems: 15
      minItems: 1
      type: array
      items:
        $ref: '#/components/schemas/PreLoadRequest'
```
5. Change the `paths.["/delivery/attachments/preload"].post.requestBody`
``` yaml
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PreLoadBulkRequest'
        required: true
```
6. Replace the reference of errors from `#/components/schemas/schemas-ProblemError` to `#/components/schemas/ProblemError`
7. Remove `schemas-ProblemError`.
8. Done

```
# Run the following command form ./openapi
cd openapi

# 1.
curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.35/swagger-codegen-cli-3.0.35.jar -O

# 2.
java -jar swagger-codegen-cli-3.0.35.jar generate -l openapi-yaml -i https://raw.githubusercontent.com/pagopa/pn-delivery/6ba267f9d73ce2625bb259f288431a20052d8798/docs/openapi/api-external-b2b-pa-bundle.yaml -o . -DoutputFile=bundled-api-external-b2b-pa-v1.yaml
```
