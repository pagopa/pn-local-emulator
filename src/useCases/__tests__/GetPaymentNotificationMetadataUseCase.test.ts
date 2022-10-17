import * as E from 'fp-ts/Either';
import * as data from '../../domain/__tests__/data';
import { GetPaymentNotificationMetadataUseCase } from '../GetPaymentNotificationMetadataUseCase';

describe('GetPaymentNotificationMetadataUseCase', () => {
  it('should return 404', async () => {
    const useCase = GetPaymentNotificationMetadataUseCase(data.makeTestSystemEnv());

    const expected = E.right({ statusCode: 404, returned: undefined });
    const actual = await useCase(data.apiKey.valid)(data.aIun.valid)(0)('PAGOPA')();

    expect(actual).toStrictEqual(expected);
  });

  it('should return 200 given the iun, the recipient id and the attachment name', async () => {
    const useCase = GetPaymentNotificationMetadataUseCase(
      data.makeTestSystemEnv(
        [data.newNotificationRecord, data.newNotificationRecordWithIdempotenceToken],
        [data.checkNotificationStatusRecord, data.checkNotificationStatusRecordAccepted]
      )
    );
    const { apiKey, iun, recipientId, attachmentName } = data.getPaymentNotificationMetadataRecord.input;

    const expected = E.right(data.getPaymentNotificationMetadataRecord.output);
    const actual = await useCase(apiKey)(iun)(recipientId)(attachmentName)();

    expect(actual).toStrictEqual(expected);
  });
});
