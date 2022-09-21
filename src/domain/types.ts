export type StatusCode = 200 | 202 | 403 | 404;

export type Response<A extends StatusCode, B = void> = {
  statusCode: A;
  returned: B;
};

// TODO: This should be generated from the OpenAPI spec
export type UnauthorizedMessageBody = {
  message: string;
};
