/* eslint-disable functional/immutable-data */

import * as t from 'io-ts';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';

import { NewNotificationRequestStatusResponseV25 } from '../generated/pnapi/NewNotificationRequestStatusResponseV25';
import { NotificationDocument } from '../generated/pnapi/NotificationDocument';
import { PreLoadResponse } from '../generated/pnapi/PreLoadResponse';

import { Notification } from './Notification';
import { AuditRecord, Record } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';
import { UploadToS3Record } from './UploadToS3Record';
import { authorizeApiKey } from './authorize';
import { computeSnapshot } from './Snapshot';
import { SystemEnv } from '../useCases/SystemEnv';
import { VALID_CAPS } from './validCaps';

export type CheckNotificationStatusRecord = AuditRecord & {
  type: 'CheckNotificationStatusRecord';
  input: {
    apiKey: string;
    body: { paProtocolNumber: string; idempotenceToken?: string } | { notificationRequestId: string };
  };
  output:
    | Response<200, NewNotificationRequestStatusResponseV25>
    | Response<500, NewNotificationRequestStatusResponseV25>
    | Response<403, UnauthorizedMessageBody>
    | Response<404>;
};

export const isCheckNotificationStatusRecord = (record: Record): O.Option<CheckNotificationStatusRecord> =>
  record.type === 'CheckNotificationStatusRecord' ? O.some(record) : O.none;

export const makeCheckNotificationStatusRecord =
  (env: SystemEnv) =>
    // eslint-disable-next-line sonarjs/cognitive-complexity
    (input: CheckNotificationStatusRecord['input']) =>
      (records: ReadonlyArray<Record>): CheckNotificationStatusRecord => ({
        type: 'CheckNotificationStatusRecord',
        input,
        loggedAt: env.dateGenerator(),
        output: pipe(
          authorizeApiKey(input.apiKey),
          E.foldW(
            (err) => err,
            () =>
              pipe(
                computeSnapshot(env)(records),
                RA.findFirst((notificationRequest) =>
                  'notificationRequestId' in input.body
                    ? (E.toUnion(notificationRequest) as Notification).notificationRequestId ===
                      input.body.notificationRequestId
                    : (E.toUnion(notificationRequest) as Notification).paProtocolNumber ===
                        input.body.paProtocolNumber &&
                      (E.toUnion(notificationRequest) as Notification).idempotenceToken ===
                        input.body.idempotenceToken
                ),
                O.map((nrOrN) =>
                  E.isLeft(nrOrN)
                    ? { ...nrOrN.left, notificationRequestStatus: 'WAITING' }
                    : t.exact(NewNotificationRequestStatusResponseV25).encode({
                        ...nrOrN.right,
                        notificationRequestStatus: 'ACCEPTED',
                      })
                ),
                // validazione CAP
                O.map((response) =>
                  pipe(
                    response.recipients,
                    RA.reduce(response, (res, invalidRec) => {
                      const newRes = t.exact(NewNotificationRequestStatusResponseV25)
                        .encode(res as NewNotificationRequestStatusResponseV25);

                      const pastErrors = newRes.errors ? newRes.errors : [];
                      const cap = invalidRec?.physicalAddress?.zip as keyof typeof VALID_CAPS | undefined;

                      if (!cap || !VALID_CAPS[cap]) {
                        return t.exact(NewNotificationRequestStatusResponseV25).encode({
                          ...(res as NewNotificationRequestStatusResponseV25),
                          notificationRequestStatus: 'REFUSED',
                          errors: [
                            ...pastErrors,
                            {
                              code: 'NOT_VALID_ADDRESS',
                              detail: `Validation failed, address is not valid. Error=Cap ${invalidRec?.physicalAddress?.zip ?? ''} not found`,
                            },
                          ],
                        });
                      }
                      return res;
                    })
                  )
                ),
                // validazione versionToken dei documenti
                O.map((response) =>
                  pipe(
                    response.documents,
                    RA.reduce(response, (respAccrRaw, docRespRaw) => {
                      const respAccr = t
                        .exact(NewNotificationRequestStatusResponseV25)
                        .encode(respAccrRaw as NewNotificationRequestStatusResponseV25);
                      const docResp = docRespRaw as NotificationDocument;

                      const key = docResp.ref.key;

                      const matchFound = RA.reduce(false, (corresponds, recordRaw) => {
                        const recordFull = recordRaw as Record;

                        if (recordFull.type === 'PreLoadRecord') {
                          const preloadRecords = recordFull.output.returned as PreLoadResponse[];

                          const hasTokenOnePreload = RA.reduce(false, (accHasToken, preloadRecordRaw) => {
                            const preloadRecord = preloadRecordRaw as PreLoadResponse;
                            const preloadKey = preloadRecord.key as string;
                            if (preloadRecord.url && key === preloadKey) {
                              const url = preloadRecord.url;

                              const hasEqualVersionToken = RA.reduce(false, (hasToken, recordRaw2) => {
                                const recordFull2 = recordRaw2 as Record;

                                if (recordFull2.type === 'UploadToS3Record') {
                                  const uploadRecord = recordRaw2 as UploadToS3Record;

                                  const uploadVersionToken = uploadRecord.output.returned.toString();
                                  if (
                                    url.includes(uploadRecord.input.url) &&
                                    docResp.ref.versionToken === uploadVersionToken
                                  ) {
                                    return true;
                                  }
                                }
                                return hasToken;
                              })(records);

                              return accHasToken || hasEqualVersionToken;
                            }

                            return accHasToken;
                          })(preloadRecords);

                          return corresponds || hasTokenOnePreload;
                        }
                        return corresponds;
                      })(records);

                      if (!matchFound) {
                        const pastErrors = respAccr.errors ? respAccr.errors : [];
                        return t.exact(NewNotificationRequestStatusResponseV25).encode({
                          ...respAccr,
                          notificationRequestStatus: 'REFUSED',
                          errors: [
                            ...pastErrors,
                            {
                              code: 'FILE_NOTFOUND',
                              detail: `Internal Server Error; versionToken ${docResp.ref.versionToken} provided by the user isn't between the valid versionTokens available (please, use one between the ones provided by the 'x-amz-version-id' headers in the upload phase)`,
                            },
                          ],
                        });
                      }

                      return respAccr;
                    })
                  )
                ),
                O.map((response) =>
                  response.notificationRequestStatus === 'REFUSED'
                    ? {
                        statusCode: 500 as const,
                        returned: Object.assign(
                          { notificationRequestId: (input.body as Notification).notificationRequestId },
                          { ...response, retryAfter: env.retryAfterMs / 1000 }
                        ),
                      }
                    : {
                        statusCode: 200 as const,
                        returned: Object.assign(
                          { notificationRequestId: (input.body as Notification).notificationRequestId },
                          { ...response, retryAfter: env.retryAfterMs / 1000 }
                        ),
                      }
                ),
                O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
              )
          )
        ),
      });
