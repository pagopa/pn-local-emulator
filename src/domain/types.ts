export type StatusCode = 200 | 202 | 401 | 404;

export type Response<A extends StatusCode, B = void> = {
  statusCode: A;
  returned: B;
};
