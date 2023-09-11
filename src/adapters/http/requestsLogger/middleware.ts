/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable functional/no-let */
import * as t from "io-ts";
import * as E from "fp-ts/lib/Either";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as Apply from 'fp-ts/Apply';
import * as Problem from '../Problem';
import { SystemEnv } from "../../../useCases/SystemEnv";
import { MiddlewareHandler } from "../Handler";
import { makeRequestResponseRecord } from "../../../domain/RequestResponseRecord";
import { persistRecord } from "../../../useCases/PersistRecord";
import { buildCurl } from '../getRequestResponse/router';
import { capturedResponse } from '../application';

export const middleware = (env: SystemEnv): MiddlewareHandler => async (req, res, next) => {
  const apiKey = req.headers["x-api-key"] as string;
  const requestCurl = buildCurl(req);
  let localCapturedResponse: string = `Response with HTTP status code ${res.statusCode}`;
  const baseUrl: string = req.url;
  if (baseUrl.startsWith("/uploadS3/")) {
    localCapturedResponse = localCapturedResponse.concat(`, and x-amz-version-id is: ${res.getHeader("x-amz-version-id")}`);
  }

  const inputValidation = pipe(
    Apply.sequenceS(E.Apply)({
      apiKey: t.string.decode(apiKey),
      requestCurl: t.success(requestCurl),
      responseJson: t.string.decode(capturedResponse)
    }),
    E.mapLeft((_) => ({ apiKey, requestCurl, responseJson: localCapturedResponse })),
  );

  const requestResponseRecord = makeRequestResponseRecord(env)(E.isRight(inputValidation) ? inputValidation.right : inputValidation.left);

  await pipe(
    persistRecord(env)(requestResponseRecord),
    TE.fold(
      (_) => T.of(res.status(500).send(Problem.fromNumber(500))),
      () => next
    )
  )();
};

