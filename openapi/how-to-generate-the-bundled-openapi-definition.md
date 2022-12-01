# How to generate the bundled OpenAPI definition

1. Install `java` and the `swagger-codegen-cli`
2. Run the command to generate using the language `openapi-yaml`

```
# Run the following command form ./openapi
cd openapi

# 1.
curl https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.35/swagger-codegen-cli-3.0.35.jar -O

# 2.
java -jar swagger-codegen-cli-3.0.35.jar generate -l openapi-yaml -i https://raw.githubusercontent.com/pagopa/pn-delivery/d9be81882bc9cd6eb326a2e77217f9e33d7cdfd5/docs/openapi/api-external-b2b-pa-v1.yaml -o . -DoutputFile=bundled-api-external-b2b-pa-v1.yaml
```
