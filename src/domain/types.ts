export type StatusCode = 200 | 202 | 403 | 404;

export type Response<A extends StatusCode, B = void> = {
  statusCode: A;
  returned: B;
};

export type UnauthorizedMessageBody = {
  message: string;
};
