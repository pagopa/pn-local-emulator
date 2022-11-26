import { flow, identity, pipe } from 'fp-ts/function';
import * as Apply from 'fp-ts/Apply';
import * as O from 'fp-ts/Option';
import * as R from 'fp-ts/Reader';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import { ApiKey } from '../generated/definitions/ApiKey';
import { NewStatusEnum, ProgressResponseElement } from '../generated/streams/ProgressResponseElement';
import { ProgressResponse } from '../generated/streams/ProgressResponse';
import { authorizeApiKey } from './authorize';
import { Snapshot } from './Snapshot';
import { Notification } from './Notification';
import { NotificationRequest } from './NotificationRequest';
import { DomainEnv } from './DomainEnv';
import { AllRecord, AuditRecord, Repository } from './Repository';
import { Response, UnauthorizedMessageBody } from './types';

export type ConsumeEventStreamRecord = AuditRecord & {
  type: 'ConsumeEventStreamRecord';
  input: { apiKey: ApiKey; streamId: string; lastEventId?: string };
  output: Response<200, ProgressResponse> | Response<403, UnauthorizedMessageBody> | Response<419>;
};

export type ConsumeEventStreamRecordRepository = Repository<ConsumeEventStreamRecord>;

export const isConsumeEventStreamRecord = (record: AllRecord): O.Option<ConsumeEventStreamRecord> =>
  record.type === 'ConsumeEventStreamRecord' ? O.some(record) : O.none;

const getProgressResponse = (record: ConsumeEventStreamRecord): O.Option<ProgressResponse> =>
  record.output.statusCode === 200 ? O.some(record.output.returned) : O.none;

export const getProgressResponseList = flow(RA.filterMap(getProgressResponse), RA.flatten);

const makeProgressResponseElementFromNotification =
  (timestamp: Date) =>
  (notification: Notification): ProgressResponseElement => ({
    ...makeProgressResponseElementFromNotificationRequest(timestamp)(notification),
    iun: notification.iun,
    newStatus: NewStatusEnum.ACCEPTED,
  });

const makeProgressResponseElementFromNotificationRequest =
  (timestamp: Date) =>
  (notificationRequest: NotificationRequest): ProgressResponseElement => ({
    eventId: '0',
    timestamp,
    notificationRequestId: notificationRequest.notificationRequestId,
  });

const makeResponse = ({ request, snapshot, dateGenerator }: In): ConsumeEventStreamRecord['output'] => ({
  statusCode: 200 as const,
  returned: pipe(
    snapshot,
    RA.map(
      E.fold(
        makeProgressResponseElementFromNotificationRequest(dateGenerator()),
        makeProgressResponseElementFromNotification(dateGenerator())
      )
    ),
    // override the eventId to create a simple cursor based pagination
    RA.mapWithIndex((i, elem) => ({ ...elem, eventId: i.toString() })),
    RA.filterWithIndex((i) => i > parseInt(request.lastEventId || '-1', 10))
  ),
});

type In = DomainEnv & {
  request: ConsumeEventStreamRecord['input'];
  snapshot: Snapshot;
};

export const makeConsumeEventStreamRecord: R.Reader<In, ConsumeEventStreamRecord> = Apply.sequenceS(R.Apply)({
  type: R.of('ConsumeEventStreamRecord' as const),
  input: (_) => _.request,
  output: (input) =>
    pipe(
      authorizeApiKey(input.request.apiKey),
      E.fold(identity, () => makeResponse(input))
    ),
  loggedAt: (_) => _.dateGenerator(),
});
