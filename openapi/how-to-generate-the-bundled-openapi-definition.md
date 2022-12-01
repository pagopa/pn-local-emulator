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
6. Change the `paths.["/delivery-push/{iun}/legal-facts/{legalFactType}/{legalFactId}"].get.parameters`
   - Comment the `$ref` from the parameter `legalFactType` and add `type: string.`
7. Change the `paths.["/delivery/price/{paTaxId}/{noticeCode}"].get.parameters`
   - Comment the `$ref` from the parameter `paTaxId` and add `type: string.`
   - Comment the `$ref` from the parameter `noticeCode` and add `type: string.`
6. Done

```
# Run the following command form ./openapi
cd openapi

# 1.
curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.35/swagger-codegen-cli-3.0.35.jar -O

# 2.
java -jar swagger-codegen-cli-3.0.35.jar generate -l openapi-yaml -i https://raw.githubusercontent.com/pagopa/pn-delivery/d9be81882bc9cd6eb326a2e77217f9e33d7cdfd5/docs/openapi/api-external-b2b-pa-v1.yaml -o . -DoutputFile=bundled-api-external-b2b-pa-v1.yaml
```
