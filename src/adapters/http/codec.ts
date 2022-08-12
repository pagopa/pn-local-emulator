import * as ts from 'io-ts';
import * as PR from 'io-ts/PathReporter';
import { Problem } from '../../generated/definitions/Problem';

export const makeProblemFromErrors = (errors: ts.Errors): Problem => ({
  type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-400-status-code/`,
  // TODO: fix this bad cast
  status: 400 as null,
  title: 'Bad input',
  detail: PR.failure(errors),
  errors: [],
});

export const makeProblem = (statusCode: number): Problem => ({
  type: `https://www.webfx.com/web-development/glossary/http-status-codes/what-is-a-${statusCode}-status-code/`,
  // TODO: fix this bad cast
  status: statusCode as null,
  title: '${statusCode}',
  errors: [],
});
