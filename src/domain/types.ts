import { unsafeCoerce } from 'fp-ts/lib/function';
import { Problem } from '../generated/pnapi/Problem';

export type StatusCode = 200 | 202 | 204 | 403 | 404 | 419;

// TODO: This should be generated from the OpenAPI spec
export type UnauthorizedMessageBody = {
  message: string;
};

export type Response<A extends StatusCode, B = void> = {
  statusCode: A;
  headers?: Record<'retry-after', string | number>;
  returned: B;
};

export const unauthorizedResponse: Response<403, Problem & UnauthorizedMessageBody> = {
  statusCode: 403,
  returned: {
    status: unsafeCoerce('403'),
    // TODO Remove 'message' after the migration to Problem
    message: 'User is not authorized to access this resource with an explicit deny',
    errors: [],
  },
};
