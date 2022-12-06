import { GetNotificationDetailRecordRepository } from '../domain/GetNotificationDetailRepository';
import { GetNotificationDocumentMetadataRecordRepository } from '../domain/GetNotificationDocumentMetadataRepository';
import { GetPaymentNotificationMetadataRecordRepository } from '../domain/GetPaymentNotificationMetadataRecordRepository';
import { DomainEnv } from '../domain/DomainEnv';
import { LegalFactDownloadMetadataRecordRepository } from '../domain/LegalFactDownloadMetadataRecordRepository';
import { GetNotificationPriceRecordRepository } from '../domain/GetNotificationPriceRecordRepository';
import { RecordRepository } from '../domain/Repository';

export type SystemEnv = DomainEnv & {
  // repositories
  recordRepository: RecordRepository;
  getNotificationDetailRecordRepository: GetNotificationDetailRecordRepository;
  getNotificationDocumentMetadataRecordRepository: GetNotificationDocumentMetadataRecordRepository;
  getPaymentNotificationMetadataRecordRepository: GetPaymentNotificationMetadataRecordRepository;
  getLegalFactDownloadMetadataRecordRepository: LegalFactDownloadMetadataRecordRepository;
  getNotificationPriceRecordRepository: GetNotificationPriceRecordRepository;
};
