import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import { GetLegalFactDownloadMetadataUseCase } from '../GetLegalFactDownloadMetadataUseCase';

describe('GetLegalFactDownloadMetadataUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetLegalFactDownloadMetadataUseCase(data.makeTestSystemEnv());

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.invalid)(data.aLegalFactType)(
      data.aLegalFactId
    )();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the iun, the recipient id and the attachment name', async () => {
    const useCase = GetLegalFactDownloadMetadataUseCase(
      data.makeTestSystemEnv(
        [data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken],
        [data.checkNotificationStatusRecord, data.checkNotificationStatusRecordAccepted]
      )
    );

    const expected = E.right(data.getLegalFactDownloadMetadataRecord.output);
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)(data.aLegalFactType)(data.aLegalFactId)();

    expect(actual).toStrictEqual(expected);
  });
});
