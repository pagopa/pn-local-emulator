import * as ts from 'io-ts';
import * as PR from 'io-ts/PathReporter';
import { Problem } from '../../generated/definitions/Problem';

export const fromErrors = (errors: ts.Errors): Problem => ({
  ...fromNumber(400),
  title: 'Bad Request',
  detail: PR.failure(errors),
});

export const fromNumber = (statusCode: number): Problem => ({
  type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${statusCode}-status-code/`,
  // TODO: fix this bad cast
  status: statusCode as null,
  title: '${statusCode}',
  errors: [],
});
