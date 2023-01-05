import { GetNotificationDocumentMetadataRecord } from '../GetNotificationDocumentMetadataRecord';
import { makeNotificationAttachmentDownloadMetadataResponse } from '../NotificationAttachmentDownloadMetadataResponse';
import { GetPaymentNotificationMetadataRecord } from '../GetPaymentNotificationMetadataRecord';
import {
  LegalFactDownloadMetadataRecord,
  makeLegalFactDownloadMetadataResponse,
} from '../LegalFactDownloadMetadataRecord';
import * as data from './data';
import { ConsumeEventStreamRecords } from './consumeEventStreamRecordData';
import { DownloadRecords } from './downloadRecordData';
import { GetNotificationDetailRecords } from './getNotificationDetailRecordData';

const getNotificationDocumentMetadataRecordOutput200: GetNotificationDocumentMetadataRecord['output'] = {
  statusCode: 200,
  returned: makeNotificationAttachmentDownloadMetadataResponse(data.makeTestSystemEnv())(data.aDocument0),
};

const getNotificationDocumentMetadataRecord: GetNotificationDocumentMetadataRecord = {
  type: 'GetNotificationDocumentMetadataRecord',
  input: { apiKey: data.apiKey.valid, iun: data.aIun.valid, docIdx: 0 },
  output: getNotificationDocumentMetadataRecordOutput200,
  loggedAt: data.aDate,
};

const pagoPAPaymentNotification: GetPaymentNotificationMetadataRecord = {
  type: 'GetPaymentNotificationMetadataRecord',
  input: { apiKey: data.apiKey.valid, iun: data.aIun.valid, recipientId: 0, attachmentName: 'PAGOPA' },
  output: getNotificationDocumentMetadataRecordOutput200,
  loggedAt: data.aDate,
};
const f24PaymentNotification: GetPaymentNotificationMetadataRecord = {
  ...pagoPAPaymentNotification,
  input: { ...pagoPAPaymentNotification.input, attachmentName: 'F24_STANDARD' },
};

const getLegalFactDownloadMetadataRecord: LegalFactDownloadMetadataRecord = {
  type: 'LegalFactDownloadMetadataRecord',
  input: {
    apiKey: data.apiKey.valid,
    iun: data.aIun.valid,
    legalFactType: data.aLegalFactType,
    legalFactId: data.aLegalFactId,
  },
  output: {
    statusCode: 200,
    returned: makeLegalFactDownloadMetadataResponse(data.makeTestSystemEnv()),
  },
  loggedAt: data.aDate,
};

const legalFactWithInvalidIun = {
  ...getLegalFactDownloadMetadataRecord,
  input: { ...getLegalFactDownloadMetadataRecord.input, iun: data.aIun.invalid },
};

export const MetadataRecords = {
  payment: {
    empty: [],
    onlyConsume: [...ConsumeEventStreamRecords.onlyConsumeRecords],
    withPagoPAPayment: [pagoPAPaymentNotification],
    withF24Payment: [f24PaymentNotification],
  },
  notification: {
    empty: [],
    onlyConsume: [...ConsumeEventStreamRecords.onlyConsumeRecords],
    onlyNotification: [getNotificationDocumentMetadataRecord],
    withAcceptedEventAndMetadata: [
      ...ConsumeEventStreamRecords.withAcceptedEvent,
      getNotificationDocumentMetadataRecord,
    ],
    withoutDocumentWithDownloadRequest: [
      ...ConsumeEventStreamRecords.onlyConsumeRecords,
      pagoPAPaymentNotification,
      ...DownloadRecords.onlyDownload,
    ],
    withDocumentWithDownloadRequest: [
      ...ConsumeEventStreamRecords.onlyConsumeRecords,
      getNotificationDocumentMetadataRecord,
      ...DownloadRecords.onlyDownload,
    ],
  },
  legalFact: {
    empty: [],
    onlyLegalFact: [getLegalFactDownloadMetadataRecord],
    onlyLegalFactWithInvalidIun: [legalFactWithInvalidIun],
    withAcceptedNotification: [getLegalFactDownloadMetadataRecord, ...GetNotificationDetailRecords.one],
    withInvalidIunAndWithTimeline: [legalFactWithInvalidIun, ...GetNotificationDetailRecords.withTimeline],
    validWithTimeline: [getLegalFactDownloadMetadataRecord, ...GetNotificationDetailRecords.withTimeline],
  },
};
