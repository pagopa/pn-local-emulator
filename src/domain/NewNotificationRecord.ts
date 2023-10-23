import { pipe } from 'fp-ts/lib/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { NewNotificationRequest } from '../generated/pnapi/NewNotificationRequest';
import { NewNotificationResponse } from '../generated/pnapi/NewNotificationResponse';
import { DomainEnv } from './DomainEnv';
import { Record, AuditRecord } from './Repository';
import { HttpErrorMessageBody, Response } from './types';

export type NewNotificationRecord = AuditRecord & {
  type: 'NewNotificationRecord';
  input: { apiKey: string; body: NewNotificationRequest };
  output: Response<202, NewNotificationResponse> | Response<403, HttpErrorMessageBody> | Response<400, HttpErrorMessageBody>;
};

export const isNewNotificationRecord = (record: Record): O.Option<NewNotificationRecord> =>
  record.type === 'NewNotificationRecord' ? O.some(record) : O.none;
  
export const makeNewNotificationRecord =
  (env: DomainEnv) =>
  (input: NewNotificationRecord['input']): NewNotificationRecord => {
    const isRequestAuthorized = authorizeApiKey(input.apiKey);

    if (!isRequestAuthorized) {
      return {
        type: 'NewNotificationRecord',
        input,
        loggedAt: env.dateGenerator(),
        output: {
          statusCode: 403,
          returned: generateErrorResponse(403, "Forbidden", "API key authorization failed"),
        }
      };
    }

    const resultFromInputValidation = pipe(
      input.body.notificationFeePolicy === 'FLAT_RATE',
      isFlatRate => {
        if (isFlatRate) {
          return input.body.recipients.some(recipient => recipient.applyCost)
            ? E.left({
                statusCode: 400,
                returned: generateErrorResponse(400, "Bad Request", "Invalid request: FLAT_RATE notification cannot have recipients with applyCost set to true"),
              })
            : E.right(generateSuccessfulResponse(env, input));
        } else if (input.body.notificationFeePolicy === 'DELIVERY_MODE') {
          return input.body.recipients.every(recipient => recipient.applyCost === false)
            ? E.left({
                statusCode: 400,
                returned: generateErrorResponse(400, "Bad Request", "Invalid request: DELIVERY_MODE notification have no recipients with applyCost set to true"),
              })
            : E.right(generateSuccessfulResponse(env, input));
        } else {
          return E.right(generateSuccessfulResponse(env, input));
        }
      }
    );

    return {
      type: 'NewNotificationRecord',
      input,
      loggedAt: env.dateGenerator(),
      output: E.foldW(
        (error) => error as Response<400, HttpErrorMessageBody>,
        (success ) => ({
          statusCode: 202,
          returned: success,
        }) as Response<202, NewNotificationResponse>
      )(resultFromInputValidation),
    };
  };

  const authorizeApiKey = (apiKey: string): boolean => apiKey === 'key-value';

  const generateErrorResponse = (httpStatusCode: number, httpTitle: string, httpMessage: string): HttpErrorMessageBody => ({
    status: httpStatusCode,
    title: httpTitle,
    errors: [],
    detail: httpMessage,
    timestamp: new Date(),
    traceId:
      'Self=1-631b10db-2c591f3f79954187229939e5;Root=1-631b11db-39caf6636f4ed15618461d95;Parent=6e2ef00e703981ac;Sampled=1',
  });
  
  const generateSuccessfulResponse = (env: DomainEnv, input: NewNotificationRecord['input']) => ({
      idempotenceToken: input.body.idempotenceToken,
      paProtocolNumber: input.body.paProtocolNumber,
      notificationRequestId: env.iunGenerator(),
  });