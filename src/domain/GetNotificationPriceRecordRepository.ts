import * as Apply from 'fp-ts/Apply';
import { pipe } from 'fp-ts/lib/function';
import * as R from 'fp-ts/Reader';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NotificationPriceResponse } from '../generated/definitions/NotificationPriceResponse';
import { authorizeApiKey } from './authorize';
import { DomainEnv } from './DomainEnv';
import { AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody, unauthorizedResponse } from './types';
import { Snapshot } from './Snapshot';

export type GetNotificationPriceRecord = AuditRecord & {
  type: 'GetNotificationPriceRecord';
  input: { apiKey: ApiKey; paTaxId: string; noticeCode: string };
  output: Response<200, NotificationPriceResponse> | Response<403, UnauthorizedMessageBody>;
};

export type GetNotificationPriceRecordRepository = Repository<GetNotificationPriceRecord>;

const findNotification = (request: GetNotificationPriceRecord['input'], snapshot: Snapshot) =>
  pipe(
    snapshot,
    RA.filterMap(O.FromEither.fromEither),
    RA.findLast(({ recipients }) =>
      pipe(
        recipients,
        RA.exists(
          ({ payment }) => payment?.creditorTaxId === request.paTaxId && payment?.noticeCode === request.noticeCode
        )
      )
    )
  );

export const makeGetNotificationPriceRecord: R.Reader<
  DomainEnv & {
    request: GetNotificationPriceRecord['input'];
    snapshot: Snapshot;
  },
  GetNotificationPriceRecord
> = Apply.sequenceS(R.Apply)({
  type: R.of('GetNotificationPriceRecord' as const),
  input: (input) => input.request,
  output: (input) =>
    pipe(
      authorizeApiKey(input.request.apiKey),
      E.map(() => findNotification(input.request, input.snapshot)),
      E.map(
        O.foldW(
          () => unauthorizedResponse,
          ({ iun }) => ({
            statusCode: 200 as const,
            returned: {
              iun,
              amount: '1',
              effectiveDate: input.dateGenerator(),
            },
          })
        )
      ),
      E.toUnion
    ),
  loggedAt: (input) => input.dateGenerator(),
});
