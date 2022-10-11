import { GetNotificationDocumentMetadataUseCase } from '../GetNotificationDocumentMetadataUseCase';
import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';

describe('GetNotificationStatusUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetNotificationDocumentMetadataUseCase(data.makeTestSystemEnv());

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)(0)();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the iun and the docIdx', async () => {
    const useCase = GetNotificationDocumentMetadataUseCase(
      data.makeTestSystemEnv(
        [data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken],
        [data.checkNotificationStatusRecord, data.checkNotificationStatusRecordAccepted]
      )
    );
    const { apiKey: apiKey0, iun: iun0, docIdx: docIdx0 } = data.getNotificationDocumentMetadataRecord0.input;
    const { apiKey: apiKey1, iun: iun1, docIdx: docIdx1 } = data.getNotificationDocumentMetadataRecord1.input;

    const expected0 = E.right(data.getNotificationDocumentMetadataRecord0.output);
    const actual0 = await useCase(apiKey0)(iun0)(docIdx0)();

    const expected1 = E.right(data.getNotificationDocumentMetadataRecord1.output);
    const actual1 = await useCase(apiKey1)(iun1)(docIdx1)();

    expect(actual0).toStrictEqual(expected0);
    expect(actual1).toStrictEqual(expected1);
  });
});
