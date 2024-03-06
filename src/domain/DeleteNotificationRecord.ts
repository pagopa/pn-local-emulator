/* eslint-disable functional/immutable-data */

// DeleteNotificationRecord.ts

import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { IUN } from '../generated/pnapi/IUN';
import { RequestStatus } from '../generated/pnapi/RequestStatus';
import { FullSentNotificationV23 } from '../generated/pnapi/FullSentNotificationV23';
import { NotificationStatusEnum } from '../generated/pnapi/NotificationStatus';
import { AuditRecord, Record } from './Repository';
import { HttpErrorMessageBody, Response, UnauthorizedMessageBody } from './types';
import { DomainEnv } from './DomainEnv';
import { authorizeApiKey } from './authorize';
import { GetNotificationDetailRecord } from './GetNotificationDetailRecord';
import { generateErrorResponse } from './NewNotificationRecord';

export type DeleteNotificationRecord = AuditRecord & {
  type: 'DeleteNotificationRecord';
  input: { apiKey: string; iun: IUN };
  output: Response<202, RequestStatus> | Response<403, UnauthorizedMessageBody> | Response<404, HttpErrorMessageBody>;
};

export const makeDeleteNotificationRecord =
  (env: DomainEnv) =>
  (input: DeleteNotificationRecord['input']) =>
  (records: ReadonlyArray<Record>): DeleteNotificationRecord => {
    const isRequestAuthorized = authorizeApiKey(input.apiKey);

    if (!isRequestAuthorized) {
      return {
        type: 'DeleteNotificationRecord',
        input,
        loggedAt: env.dateGenerator(),
        output: {
          statusCode: 403,
          returned: { message: 'Forbidden API key authorization failed' },
        },
      };
    }

    const getNotificationDetailRecord: GetNotificationDetailRecord = records.filter(
      (singleRecord) => singleRecord.type === 'GetNotificationDetailRecord'
    )[0] as GetNotificationDetailRecord;
    if (getNotificationDetailRecord === undefined || getNotificationDetailRecord.input.iun !== input.iun) {
      return {
        type: 'DeleteNotificationRecord',
        input,
        loggedAt: env.dateGenerator(),
        output: {
          statusCode: 404,
          returned: generateErrorResponse(
            404,
            'IUN not found',
            'The IUN provided is not a valid one. Please provide a valid IUN.'
          ),
        },
      };
    }

    const resultFromInputValidation = pipe(
      (getNotificationDetailRecord.output.returned as FullSentNotificationV23).iun === input.iun,
      (isValidIun) => {
        if (isValidIun) {
          if (
            (getNotificationDetailRecord.output.returned as FullSentNotificationV23).notificationStatus === 'ACCEPTED'
          ) {
            (
              (
                records.filter(
                  (singleRecord) => singleRecord.type === 'GetNotificationDetailRecord'
                )[0] as GetNotificationDetailRecord
              ).output.returned as FullSentNotificationV23
            ).notificationStatus = NotificationStatusEnum.CANCELLED;
            return E.right({
              status: 'Notification cancellation success',
              details: [
                {
                  code: 'NOTIFICATION_CANCELLATION_ACCEPTED',
                  level: 'INFO',
                  detail: 'Notification cancellation accepted',
                },
              ],
            });
          } else if (
            (getNotificationDetailRecord.output.returned as FullSentNotificationV23).notificationStatus === 'CANCELLED'
          ) {
            return E.right({
              status: 'Notification already cancelled',
              details: [
                {
                  code: 'NOTIFICATION_ALREADY_CANCELLED',
                  level: 'INFO',
                  detail: 'Notification already cancelled',
                },
              ],
            });
          }
        }
        return E.left(
          generateErrorResponse(
            404,
            'IUN not found',
            'The IUN provided is not a valid one. Please provide a valid IUN.'
          )
        );
      }
    );

    return {
      type: 'DeleteNotificationRecord',
      input,
      loggedAt: env.dateGenerator(),
      output: E.foldW(
        (error) => error as Response<404, HttpErrorMessageBody>,
        (success) =>
          ({
            statusCode: 202,
            returned: success,
          } as Response<202, RequestStatus>)
      )(resultFromInputValidation),
    };
  };

export const isDeleteNotificationRecord = (record: Record): O.Option<DeleteNotificationRecord> =>
  record.type === 'DeleteNotificationRecord' ? O.some(record) : O.none;
