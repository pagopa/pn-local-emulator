import * as ts from 'io-ts';
import * as PR from 'io-ts/PathReporter';
import { Problem } from '../../generated/definitions/Problem';

export const makeProblemFromErrors = (errors: ts.Errors): Problem => ({
  ...makeProblem(400),
  title: 'Bad Request',
  detail: PR.failure(errors),
});

export const makeProblem = (statusCode: number): Problem => ({
  type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${statusCode}-status-code/`,
  // TODO: fix this bad cast
  status: statusCode as null,
  title: '${statusCode}',
  errors: [],
});
