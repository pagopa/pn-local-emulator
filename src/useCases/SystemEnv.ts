import { ConsumeEventStreamRecordRepository } from '../domain/ConsumeEventStreamRecordRepository';
import { GetNotificationDetailRecordRepository } from '../domain/GetNotificationDetailRepository';
import { GetNotificationDocumentMetadataRecordRepository } from '../domain/GetNotificationDocumentMetadataRepository';
import { GetPaymentNotificationMetadataRecordRepository } from '../domain/GetPaymentNotificationMetadataRecordRepository';
import { DomainEnv } from '../domain/DomainEnv';
import { CreateEventStreamRecordRepository } from '../domain/CreateEventStreamRecordRepository';
import { LegalFactDownloadMetadataRecordRepository } from '../domain/LegalFactDownloadMetadataRecordRepository';
import { ListEventStreamRecordRepository } from '../domain/ListEventStreamRecordRepository';
import { GetNotificationPriceRecordRepository } from '../domain/GetNotificationPriceRecordRepository';
import { RecordRepository } from '../domain/Repository';

export type SystemEnv = DomainEnv & {
  // repositories
  recordRepository: RecordRepository;
  createEventStreamRecordRepository: CreateEventStreamRecordRepository;
  consumeEventStreamRecordRepository: ConsumeEventStreamRecordRepository;
  listEventStreamRecordRepository: ListEventStreamRecordRepository;
  getNotificationDetailRecordRepository: GetNotificationDetailRecordRepository;
  getNotificationDocumentMetadataRecordRepository: GetNotificationDocumentMetadataRecordRepository;
  getPaymentNotificationMetadataRecordRepository: GetPaymentNotificationMetadataRecordRepository;
  getLegalFactDownloadMetadataRecordRepository: LegalFactDownloadMetadataRecordRepository;
  getNotificationPriceRecordRepository: GetNotificationPriceRecordRepository;
};
