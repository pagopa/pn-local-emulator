import { flow, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import * as R from 'fp-ts/Reader';
import * as P from 'fp-ts/Predicate';
import { Reader } from 'fp-ts/Reader';
import * as ConsumeEventStreamRecord from '../ConsumeEventStreamRecord';
import * as CreateEventStreamRecordRepository from '../CreateEventStreamRecord';
import { NewStatusEnum } from '../../generated/streams/ProgressResponseElement';
import { Record } from '../Repository';
import { DomainEnv } from '../DomainEnv';
import { existsCreateEventStreamRecordWhitStreamId } from './CreateEventStreamRecordChecks';

export const requestWithStreamIdProvidedHasBeenMadeC = pipe(
  R.Do,
  R.apS('createEventStreamRecordList', RA.filterMap(CreateEventStreamRecordRepository.isCreateEventStreamRecord)),
  R.apS('consumeEventStreamRecordList', RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord)),
  R.map(({ createEventStreamRecordList, consumeEventStreamRecordList }) =>
    pipe(
      consumeEventStreamRecordList,
      RA.chainFirst(flow(RA.of, ConsumeEventStreamRecord.getProgressResponseList)),
      RA.map(({ input }) => input.streamId),
      RA.exists(existsCreateEventStreamRecordWhitStreamId(createEventStreamRecordList))
    )
  )
);

export const hasNewStatusPropertySetToAcceptedC = flow(
  RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord),
  ConsumeEventStreamRecord.getProgressResponseList,
  RA.exists(({ newStatus }) => newStatus === NewStatusEnum.ACCEPTED)
);

export const hasIunPopulatedC = flow(
  RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord),
  ConsumeEventStreamRecord.getProgressResponseList,
  RA.exists(({ iun }) => pipe(iun, O.fromNullable, O.isSome))
);

export const hasHonouredRetryAfterValueC =
  (env: DomainEnv) =>
  (records: ReadonlyArray<Record>): boolean =>
    pipe(
      records,
      RA.filterMap(ConsumeEventStreamRecord.isConsumeEventStreamRecord),
      RA.map(({ loggedAt }) => loggedAt.getTime()),
      flow(
        RA.reduce({ prev: 0, result: true }, ({ prev, result }, curr: number) =>
          curr - prev >= env.retryAfterMs ? { prev: curr, result } : { prev: curr, result: false }
        ),
        ({ result }) => result
      )
    );

export const hasProperlyConsumedEvents = (env: DomainEnv): Reader<ReadonlyArray<Record>, boolean> =>
  RA.exists(
    flow(
      RA.of,
      pipe(hasNewStatusPropertySetToAcceptedC, P.and(hasIunPopulatedC), P.and(hasHonouredRetryAfterValueC(env)))
    )
  );
