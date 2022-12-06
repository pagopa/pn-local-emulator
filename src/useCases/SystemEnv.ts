import { GetPaymentNotificationMetadataRecordRepository } from '../domain/GetPaymentNotificationMetadataRecordRepository';
import { DomainEnv } from '../domain/DomainEnv';
import { LegalFactDownloadMetadataRecordRepository } from '../domain/LegalFactDownloadMetadataRecordRepository';
import { RecordRepository } from '../domain/Repository';

export type SystemEnv = DomainEnv & {
  // repositories
  recordRepository: RecordRepository;
  getPaymentNotificationMetadataRecordRepository: GetPaymentNotificationMetadataRecordRepository;
  getLegalFactDownloadMetadataRecordRepository: LegalFactDownloadMetadataRecordRepository;
};
