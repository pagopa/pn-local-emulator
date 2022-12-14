export type StatusCode = 200 | 202 | 403 | 404 | 419;

// TODO: This should be generated from the OpenAPI spec
export type UnauthorizedMessageBody = {
  message: string;
};

const unauthorizedMessage: UnauthorizedMessageBody = {
  message: 'User is not authorized to access this resource with an explicit deny',
};

export type Response<A extends StatusCode, B = void> = {
  statusCode: A;
  returned: B;
};

export const unauthorizedResponse: Response<403, UnauthorizedMessageBody> = {
  statusCode: 403,
  returned: unauthorizedMessage,
};
