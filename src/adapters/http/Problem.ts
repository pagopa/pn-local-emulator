import * as ts from 'io-ts';
import * as PR from 'io-ts/PathReporter';
import { Problem } from '../../generated/pnapi/Problem';

export const fromErrors = (errors: ts.Errors): Problem => ({
  ...fromNumber(400),
  title: 'Bad Request',
  detail: PR.failure(errors),
  timestamp: new Date(),
  traceId:
    'Self=1-631b10db-2c591f3f79954187229939e5;Root=1-631b11db-39caf6636f4ed15618461d95;Parent=6e2ef00e703981ac;Sampled=1',
});

export const fromNumber = (statusCode: number): Problem => ({
  type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${statusCode}-status-code/`,
  // TODO: fix this bad cast
  status: statusCode as never,
  title: `${statusCode}`,
  errors: [],
});
