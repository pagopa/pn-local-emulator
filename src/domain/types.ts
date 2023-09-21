import { unsafeCoerce } from 'fp-ts/lib/function';
import { Problem } from '../generated/pnapi/Problem';
import { ProblemError } from '../generated/pnapi/ProblemError';

export type StatusCode = 200 | 202 | 204 | 403 | 404 | 419 | 500;

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

export const notFoundResponse = (code: ProblemError['code']): Response<404, Problem> => ({
  statusCode: 404,
  returned: {
    type: 'GENERIC_ERROR',
    status: unsafeCoerce(404),
    title: 'Handled error',
    detail: 'See logs for details in PN-DELIVERY',
    traceId:
      'Self=1-646deb9f-6023927e51d381697e980ba6;Root=1-646deb9f-1d2c9ba65248ec0d4443c619;Parent=460516422016bd64;Sampled=1',
    errors: [
      {
        code,
        detail: 'none',
      },
    ],
  },
});
