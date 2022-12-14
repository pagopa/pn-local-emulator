import { pipe } from 'fp-ts/lib/function';
import * as E from 'fp-ts/Either';
import * as RA from 'fp-ts/ReadonlyArray';
import * as data from '../../domain/__tests__/data';
import { GetNotificationDetailUseCase } from '../GetNotificationDetailUseCase';

describe('GetNotificationDetailUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetNotificationDetailUseCase(data.makeTestSystemEnv());

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200', async () => {
    const useCase = GetNotificationDetailUseCase({
      ...data.makeTestSystemEnv(
        [],
        [],
        [data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken],
        [data.checkNotificationStatusRecord, data.checkNotificationStatusRecordAccepted]
      ),
      dateGenerator: () => data.aDate,
      iunGenerator: () => data.aIun.valid,
    });

    const expected = E.right(data.getNotificationDetailRecordAccepted.output);
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)();

    const checkDocIdxIsDefined = pipe(
      RA.fromEither(actual),
      RA.chain(({ statusCode, returned }) => (statusCode === 200 ? returned.documents : RA.empty)),
      RA.every(({ docIdx }) => docIdx !== undefined)
    );

    expect(actual).toStrictEqual(expected);
    expect(checkDocIdxIsDefined).toBeTruthy();
  });
});
