import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import { flow, identity, pipe } from 'fp-ts/function';
import * as t from 'io-ts';
import { NewNotificationRequestStatusResponseV23 } from '../generated/pnapi/NewNotificationRequestStatusResponseV23';
import { NotificationDocument } from '../generated/pnapi/NotificationDocument';
import { PreLoadResponse } from '../generated/pnapi/PreLoadResponse';
import { SystemEnv } from '../useCases/SystemEnv';
import { Notification } from './Notification';
import { AuditRecord, Record } from './Repository';
import { computeSnapshot } from './Snapshot';
import { UploadToS3Record } from './UploadToS3Record';
import { authorizeApiKey } from './authorize';
import { Response, UnauthorizedMessageBody } from './types';
import { VALID_CAPS } from './validCaps';

export type CheckNotificationStatusRecord = AuditRecord & {
  type: 'CheckNotificationStatusRecord';
  input: {
    apiKey: string;
    body: { paProtocolNumber: string; idempotenceToken?: string } | { notificationRequestId: string };
  };
  output:
  | Response<200, NewNotificationRequestStatusResponseV23>
  | Response<500, NewNotificationRequestStatusResponseV23>
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
          E.foldW(identity, () =>
            pipe(
              computeSnapshot(env)(records),
              RA.findFirst(
                flow(E.toUnion, (notificationRequest) =>
                  'notificationRequestId' in input.body
                    ? (notificationRequest as Notification).notificationRequestId === input.body.notificationRequestId
                    : notificationRequest.paProtocolNumber === input.body.paProtocolNumber &&
                    notificationRequest.idempotenceToken === input.body.idempotenceToken
                )
              ),
              O.map(
                E.fold(
                  (nr) => ({ ...nr, notificationRequestStatus: 'WAITING' }),
                  (n) =>
                    t.exact(NewNotificationRequestStatusResponseV23).encode({ ...n, notificationRequestStatus: 'ACCEPTED' })
                )
              ),
              O.map((response) =>
                pipe(
                  response.recipients,
                  RA.reduce(response, function (res, invalidRec) {
                    const newRes = t.exact(NewNotificationRequestStatusResponseV23).encode(res as NewNotificationRequestStatusResponseV23);
                    const pastErrors = newRes.errors ? newRes.errors : [];
                    if (!VALID_CAPS[invalidRec.physicalAddress.zip as keyof typeof VALID_CAPS]) {
                      return t.exact(NewNotificationRequestStatusResponseV23).encode({
                        ...res as NewNotificationRequestStatusResponseV23,
                        notificationRequestStatus: 'REFUSED',
                        errors: [
                          ...pastErrors,
                          {
                            code: 'NOT_VALID_ADDRESS',
                            detail: `Validation failed, address is not valid. Error=Cap ${invalidRec.physicalAddress.zip} not found`,
                          },
                        ],
                      });
                    }
                    return res;
                  })
                )
              ),
              O.map((response) =>
                pipe(
                  response.documents,
                  // Scroll throw the documents of the responce
                  RA.reduce(response, (respAccrRaw, docRespRaw) => {
                    const respAccr = t.exact(NewNotificationRequestStatusResponseV23).encode(respAccrRaw as NewNotificationRequestStatusResponseV23);
                    const docResp = docRespRaw as NotificationDocument;

                    const key = docResp.ref.key;

                    // Scroll throw the records saved in memory
                    const matchFound = RA.reduce(false, (corresponds, recordRaw) => {
                      const recordFull = recordRaw as Record;

                      //  Scroll throw the documents of a record in memory to get the URL
                      if (recordFull.type === 'PreLoadRecord') {
                        const preloadRecords = recordFull.output.returned as PreLoadResponse[];

                        const hasTokenOnePreload = RA.reduce(false, (hasTokenOnePreload, preloadRecordRaw) => {
                          const preloadRecord = preloadRecordRaw as PreLoadResponse;
                          const preloadKey: string = preloadRecord.key as string;
                          if (preloadRecord.url && key === preloadKey) {
                            const url = preloadRecord.url;

                            // Scroll uploaded records
                            const hasEqualVersionToken = RA.reduce(false, (hasToken, recordRaw2) => {
                              const recordFull2 = recordRaw2 as Record;

                              // Check if the URL mach
                              if (recordFull2.type === 'UploadToS3Record') {
                                const uploadRecord = recordRaw2 as UploadToS3Record;

                                // Version Tokens
                                const uploadVersionToken = uploadRecord.output.returned.toString();
                                // eslint-disable-next-line sonarjs/prefer-single-boolean-return
                                if (
                                  url.includes(uploadRecord.input.url) &&
                                  docResp.ref.versionToken === uploadVersionToken
                                ) {
                                  return true;
                                }
                              }
                              return hasToken;
                            })(records);

                            return hasTokenOnePreload || hasEqualVersionToken;
                          }

                          return hasTokenOnePreload;
                        })(preloadRecords);

                        return corresponds || hasTokenOnePreload;
                      }
                      return corresponds;
                    })(records);

                    if (!matchFound) {
                      const pastErrors = respAccr.errors ? respAccr.errors : [];
                      return t.exact(NewNotificationRequestStatusResponseV23).encode({
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
                    returned: Object.assign({ notificationRequestId: (input.body as Notification).notificationRequestId }, { ...response, retryAfter: env.retryAfterMs / 1000 }),
                  }
                  : {
                    statusCode: 200 as const,
                    returned: Object.assign({ notificationRequestId: (input.body as Notification).notificationRequestId }, { ...response, retryAfter: env.retryAfterMs / 1000 }),
                  }
              ),
              O.getOrElseW(() => ({ statusCode: 404 as const, returned: undefined }))
            )
          )
        ),
      });
